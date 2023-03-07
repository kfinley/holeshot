import { RemovalPolicy, ScopedAws } from 'aws-cdk-lib'
import { AttributeType, BillingMode, ITable, ProjectionType, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GeoDataManagerConfiguration, GeoTableUtil } from 'dynamodb-geo-v3';

export interface DataStoresProps {
  domainName: string,
}

export class DataStores extends Construct {

  readonly connectionsTable: Table;
  readonly frontEndBucket: Bucket;
  readonly mediaBucket: Bucket;
  readonly coreTable: Table;
  readonly crawlerBucket: Bucket;

  constructor(scope: Construct, id: string, props?: DataStoresProps) {
    super(scope, id);

    const {
      accountId,
      region,
    } = new ScopedAws(this);

    (async () => {
      try {
        const ddb = new DynamoDB({ region: 'us-east-1' });
        const config = new GeoDataManagerConfiguration(ddb, "Holeshot-Geo");
        config.hashKeyLength = 5

        const output = await ddb.createTable(GeoTableUtil.getCreateTableRequest(config));

        console.log('createTable Output', JSON.stringify(output));

        // const geoTable = Table.fromTableArn(this, 'Holeshot-Geo', `arn:aws:dynamodb:${region}:${accountId}:table/Holeshot-Geo`);

      } catch (e) {
        // If the table exists we'll get an error. Move along...
        // Uncomment to log output to check for anything unexpected
        // console.log('createTable error: ', e);
      }
    })();

    // Core Service
    this.coreTable = new Table(this, 'Core', {
      tableName: `Holeshot-Core`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 10,
      writeCapacity: 10,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false // set to "true" to enable PITR
    });

    this.coreTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      readCapacity: 10,
      writeCapacity: 10,
      projectionType: ProjectionType.ALL,
    })

    // WebSockets Service
    this.connectionsTable = new Table(this, 'WebSockets-Connections', {
      tableName: `Holeshot-WebSockets-Connections`,
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      sortKey: { name: 'connectionId', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false // set to "true" to enable PITR
    });

    // Media S3 Bucket
    this.mediaBucket = new Bucket(this, 'mediaBucket', {
      bucketName: `images.${props?.domainName}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Web Front-End Bucket
    this.frontEndBucket = new Bucket(this, 'S3Bucket', {
      bucketName: props?.domainName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            HttpMethods.GET,
          ],
          allowedOrigins: ['*'], // TODO: fix this..
          allowedHeaders: ['*'],
        },
      ],
    });

    this.crawlerBucket = new Bucket(this, 'crawlerBucket', {
      bucketName: `${props?.domainName}-crawler`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
