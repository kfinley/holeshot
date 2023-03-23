//TODO: move this to Core service and deploy an IaC Core Construct for resources
import { AttributeValue, DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { injectable, Container } from "inversify-props";
import { Command } from "@holeshot/commands/src";
import { marshall } from '@aws-sdk/util-dynamodb';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type GetEntityRequest = {
  pk: string;
  sk: string;
  container: Container;
}

export type GetEntityResponse = {
  items?: Record<string, AttributeValue>[]
  success: boolean;
}

@injectable()
export class GetEntityCommand implements Command<GetEntityRequest, GetEntityResponse> {

  // @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: GetEntityRequest): Promise<GetEntityResponse> {
    // console.log(params);

    this.ddbClient = params.container.get<DynamoDBClient>("DynamoDBClient");
    
    const getResponse = await this.ddbClient.send(new GetItemCommand({
      TableName,
      Key {
        PK: {
          S: params.pk
        },
        SK: {
          S: params.sk
        }
      }
    }));

    console.log(getResponse.Item);


    return {
      success: getResponse.$metadata.httpStatusCode == 200,
      item: getResponse.Item
    }
  }
}
