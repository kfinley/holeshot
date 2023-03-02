import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { AllowedMethods, CachePolicy, OriginRequestCookieBehavior, OriginRequestHeaderBehavior, OriginRequestPolicy, OriginRequestQueryStringBehavior, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { WebSocketsStack } from './websockets-stack';
import { DataStores } from './data-stores';
import { UserServiceStack } from './user-stack';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate, DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CrawlerService } from './crawler-service';
import { EventService } from './event-service';

// TODO: break this out  to /services/FrontEnd/Infrastructure?

export interface InfraStackProps extends StackProps {
  senderEmail: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
  node_env: string;

}

export class InfrastructureStack extends Stack {

  private hostedZone: PublicHostedZone;
  private certificate: DnsValidatedCertificate;
  private cloudFrontDistribution: cloudfront.Distribution;
  private apiOriginPolicy: OriginRequestPolicy;

  constructor(scope: Construct, id: string, props?: InfraStackProps) {
    super(scope, id, props);

    const domainName = this.node.tryGetContext('domainName');

    // Setup Data Stores
    const dataStores = new DataStores(this, 'Holeshot-DataStoreseStack', {
      domainName,
    });

    const crawlerService = new CrawlerService(this, 'Holeshot-CrawlerService', {
      domainName,
      crawlerBucket: dataStores.crawlerBucket,
      coreTable: dataStores.coreTable,
      geoTable: dataStores.geoTable,
      node_env: props!.node_env
    });

    // // Setup User Service
    const userService = new UserServiceStack(this, 'Holeshot-UserServiceStack', {
      coreTable: dataStores?.coreTable!,
      siteUrl: `https://${domainName}`,
      senderEmail: props?.senderEmail!,
      logLevel: props?.logLevel!,
      node_env: props!.node_env
    });

    // Handle Route53 DNS bits
    const {
      accountId,
      region,
    } = new cdk.ScopedAws(this);

    // Deploy Step 1: Create Hosted Zone
    const step1 = () => {
      this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
        zoneName: domainName,
        comment: `Hosted zone for ${domainName}`
      });
    };

    //TODO: update Route53 Name Servers with values from hosted zone

    // Confirm DNS works using dig before applying step 2
    // Deploy Step 2: Create Certificate
    const step2 = () => {
      this.certificate = new acm.DnsValidatedCertificate(this, 'CertificateManagerCertificate', {
        domainName,
        subjectAlternativeNames: [`ws.${domainName}`],    // placeholder for getting websocket custom domain working
        hostedZone: this.hostedZone,
        region,
        validation: acm.CertificateValidation.fromDns(),
      });

      //TODO: this fixes the deprecation error
      // this.certificate = new acm.Certificate(this, "certificate", {
      //   domainName: domainName,
      //   subjectAlternativeNames: [`ws.${domainName}`],    // placeholder for getting websocket custom domain working
      //   validation: acm.CertificateValidation.fromDns(this.hostedZone)
      // });

    }

    // Deploy Step 3: Create images CF Distro
    const step3 = () => {
      const imagesCloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'Images-CloudFrontOriginAccessIdentity', {
        comment: `images.${domainName} Domain Hosting Environment`,
      });

      //TODO: remove this and put it behind /media
      const imagesCloudFrontDistribution = new cloudfront.Distribution(this, 'Images-CloudFrontDistribution', {
        // domainNames: [domainName], //TODO: could use an images. subdomain here
        defaultBehavior: {
          origin: new origins.S3Origin(dataStores.mediaBucket, {
            originAccessIdentity: imagesCloudFrontOAI
          }),
          compress: true,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responsePagePath: '/index.html', //TODO: fix this...
            responseHttpStatus: 200,
            ttl: cdk.Duration.minutes(0),
          },
          {
            httpStatus: 404,
            responsePagePath: '/index.html', //TODO: fix this...
            responseHttpStatus: 200,
            ttl: cdk.Duration.minutes(0),
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        enabled: true,
        // certificate: certificateManagerCertificate,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        httpVersion: cloudfront.HttpVersion.HTTP2,
        // defaultRootObject: 'index.html',
        enableIpv6: true,
      });
    }

    // Deploy Step 4, Create Web CF Distro, DNS entry, and S3 BucketDeployment
    const step4 = () => {
      const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOriginAccessIdentity', {
        comment: `${domainName} Domain Hosting Environment`,
      });

      this.apiOriginPolicy = new OriginRequestPolicy(this, 'apiOriginPolicy', {
        cookieBehavior: OriginRequestCookieBehavior.all(),
        headerBehavior: OriginRequestHeaderBehavior.none(),
        queryStringBehavior: OriginRequestQueryStringBehavior.all(),
      });

      this.cloudFrontDistribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
        domainNames: [domainName],
        defaultBehavior: {
          origin: new origins.S3Origin(dataStores.frontEndBucket, {
            originAccessIdentity: cloudFrontOAI
          }),
          compress: true,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responsePagePath: '/index.html', //TODO: fix this...
            responseHttpStatus: 200,
            ttl: cdk.Duration.minutes(0),
          },
          {
            httpStatus: 404,
            responsePagePath: '/index.html', //TODO: fix this...
            responseHttpStatus: 200,
            ttl: cdk.Duration.minutes(0),
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        enabled: true,
        certificate: this.certificate,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        httpVersion: cloudfront.HttpVersion.HTTP2,
        defaultRootObject: 'index.html',
        enableIpv6: true,
      });

      new route53.ARecord(this, 'ARecord', {
        recordName: domainName,
        zone: this.hostedZone,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(this.cloudFrontDistribution)
        ),
      });

      new s3deploy.BucketDeployment(this, 'S3BucketDeploy', {
        sources: [s3deploy.Source.asset('../packages/vue2-client/dist')],
        destinationBucket: dataStores.frontEndBucket,
        distribution: this.cloudFrontDistribution,
        distributionPaths: ['/*'],
      });

    }

    // Deploy Step 5: Additional Cloudfront Behaviors, DNS Records (MX and other CNames), etc.
    const step5 = () => {


      this.cloudFrontDistribution.addBehavior('user/*',
        // Seems kludgy...
        new HttpOrigin(userService.restApi.url.replace('https://', '').replace('/v1', '')), {
        allowedMethods: AllowedMethods.ALLOW_ALL,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        compress: false,
        originRequestPolicy: this.apiOriginPolicy,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      });
      // new route53.MxRecord(this, 'MXRecords', {
      //   recordName: domainName,
      //   zone: hostedZone,
      //   values: [{
      //     hostName: 'alt1.aspmx.l.google.com',
      //     priority: 5
      //   },
      //   {
      //     hostName: 'alt2.aspmx.l.google.com',
      //     priority: 5
      //   },
      //   {
      //     hostName: 'aspmx.l.google.com',
      //     priority: 1
      //   },
      //   {
      //     hostName: 'aspmx2.googlemail.com',
      //     priority: 10
      //   },
      //   {
      //     hostName: 'aspmx3.googlemail.com',
      //     priority: 10
      //   },
      //   {
      //     hostName: `mail.${domainName}`,
      //     priority: 20
      //   }
      //   ]
      // });

      // new route53.CnameRecord(this, 'MailCNameRecord', {
      //   recordName: `mail.${domainName}`,
      //   zone: hostedZone,
      //   domainName: 'ghs.google.com'
      // })

      // new route53.TxtRecord(this, 'TxtRecord', {
      //   recordName: domainName,
      //   zone: hostedZone,
      //   values: [
      //     'v=spf1 include:aspmx.googlemail.com ~all' //TODO: research this... ~all is probably to wide here. This was pulled from old DNS records.
      //   ]
      // })
    }

    step1();

    step2();

    // Setup WebSockets
    const webSocketsApi = new WebSocketsStack(this, 'Holeshot-WebSocketsStack', {
      connectionsTable: dataStores?.connectionsTable!,
      logLevel: props?.logLevel!,
      node_env: props!.node_env,
      domainName,
      zone: this.hostedZone,
      certificate: this.certificate
    });

    const eventService = new EventService(this, 'Holeshot-EventService', {
      domainName,
      coreTable: dataStores?.coreTable,
      geoTable: dataStores?.geoTable,
      node_env: props!.node_env,
      onMessageHandler: webSocketsApi.onMessageHandler,
    });

    // new CfnOutput(this, 'apiEndpoint', {
    //   value: `${webSocketsApi.webSocketApi.apiId}.execute-api.${region}.amazonaws.com`,
    // });

    // const customDomain = new DomainName(this, 'ApiGatewayCustomDomain', {
    //   domainName: `ws.${domainName}`,
    //   certificate: Certificate.fromCertificateArn(this, 'Certificate', this.certificate.certificateArn),
    //   endpointType: EndpointType.EDGE,
    // });

    // new RecordSet(this, 'WebSocketApiRecordSetA', {
    //   zone: this.hostedZone,
    //   recordType: RecordType.A,
    //   recordName: 'ws',
    //   target: RecordTarget.fromAlias(new ApiGatewayDomain(customDomain))
    // });

    // new RecordSet(this, 'ApiRecordSetAAAA', {
    //   zone: this.hostedZone,
    //   recordType: RecordType.AAAA,
    //   recordName: 'ws',
    //   target: RecordTarget.fromAlias(new ApiGatewayDomain(customDomain))
    // });

    step3();

    step4();

    new CfnOutput(this, 'DeployURL', {
      value: `https://${domainName}`,
    });
  }
}
