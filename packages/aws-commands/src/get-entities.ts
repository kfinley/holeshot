//TODO: move this to Core service and deploy an IaC Core Construct for resources
import { AttributeValue, DynamoDBClient, PutItemCommand, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { injectable, Container } from "inversify-props";
import { Command } from "@holeshot/commands/src";
import { marshall } from '@aws-sdk/util-dynamodb';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type GetEntitiesRequest = {
  expressionAttributeValues: {};
  keyConditionExpression: string;
  filterExpression?: string;        //TODO: add this when it's needed....
  container: Container;
}

export type GetEntitiesResponse = {
  items?: Record<string, AttributeValue>[]
  success: boolean;
}

@injectable()
export class GetEntitiesCommand implements Command<GetEntitiesRequest, GetEntitiesResponse> {

  // @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: GetEntitiesRequest): Promise<GetEntitiesResponse> {
    // console.log(params);

    this.ddbClient = params.container.get<DynamoDBClient>("DynamoDBClient");
    
    const query: QueryCommandInput = {
      TableName,
      ExpressionAttributeValues: marshall(params.expressionAttributeValues),
      KeyConditionExpression: params.keyConditionExpression // "PK = :PK AND SK BETWEEN :startDate AND :endDate"
    };
    const queryOutput = await this.ddbClient.send(new QueryCommand(query));

    return {
      success: queryOutput.$metadata.httpStatusCode == 200,
      items: queryOutput.Items
    }
  }
}
