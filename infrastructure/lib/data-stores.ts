import { RemovalPolicy } from 'aws-cdk-lib'
import { AttributeType, BillingMode, ProjectionType, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
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

    const ddb = new DynamoDB({ region: 'us-east-1' });
    const config = new GeoDataManagerConfiguration(ddb, "Holeshot-Geo");
    config.hashKeyLength = 3

    const createTableInput = GeoTableUtil.getCreateTableRequest(config);

    ddb
      .createTable(createTableInput)
      // Wait for it to become ready
      .then((o) => console.log('createTable Output', o))
      .then(() => {
        console.log("Table created and ready!");
      })
      .catch(e => {
        console.log('createTable error: ', e);
      });

    // Core Service
    this.coreTable = new Table(this, 'Core', {
      tableName: `Holeshot-Core`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false // set to "true" to enable PITR
    });

    this.coreTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      readCapacity: 1,
      writeCapacity: 1,
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
