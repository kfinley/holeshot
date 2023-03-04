import { Construct } from 'constructs';
import { Function } from "aws-cdk-lib/aws-lambda";
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { BaseServiceConstruct } from './base-service-construct';
import { ScopedAws } from 'aws-cdk-lib';

export interface EventServiceProps {
  domainName: string;
  coreTable: Table;
  node_env: string;
}

export class EventService extends BaseServiceConstruct {

  readonly getNearbyEvents: Function;

  constructor(scope: Construct, id: string, props?: EventServiceProps) {
    super(scope, id, '../../services/Event/dist', props!.node_env);

    const {
      accountId,
      region,
    } = new ScopedAws(this);

    const geoTable = Table.fromTableArn(this, 'Holeshot-Geo', `arn:aws:dynamodb:${region}:${accountId}:table/Holeshot-Geo`);

    this.getNearbyEvents = super.newLambda('GetNearbyEvents', 'functions/get-nearby-events.handler', {
      HOLESHOT_CORE_TABLE: props?.coreTable.tableName as string,
      HOLESHOT_GEO_TABLE: geoTable.tableName as string
    });

    props?.coreTable.grantReadData(this.getNearbyEvents);
    geoTable.grantFullAccess(this.getNearbyEvents);

  }
}
