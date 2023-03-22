//TODO: move this to Core service and deploy an IaC Core Construct for resources
import { AttributeValue, DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { injectable, Container } from "inversify-props";
import { Command } from "@holeshot/commands/src";

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type UpdateEntityRequest = {
  pk: string;
  sk: string;
  updateExpression: string;
  expressionAttributeValues: Record<string, AttributeValue>;
  returnValues: string | undefined;  
  container: Container
}

export type UpdateEntityResponse = {
  success: boolean;
}

@injectable()
export class UpdateEntityCommand implements Command<UpdateEntityRequest, UpdateEntityResponse> {

  // @Inject("DynamoDBClient")DynamoDBClient
  private ddbClient!: DynamoDBClient;

  async runAsync(params: UpdateEntityRequest): Promise<UpdateEntityResponse> {
    console.log(JSON.stringify(params));

    this.ddbClient = params.container.get<DynamoDBClient>("DynamoDBClient");

    const key = {
      PK: {
        S: params.pk
      },
      SK: {
        S: params.sk
      }
    };

    var response = await this.ddbClient.send(new UpdateItemCommand({
      TableName,
      Key: key,
      UpdateExpression: params.updateExpression,
      ExpressionAttributeValues: params.expressionAttributeValues,
      ReturnValues: params.returnValues
    }));

    return {
      success: response.$metadata.httpStatusCode == 200
    }
  }

}
