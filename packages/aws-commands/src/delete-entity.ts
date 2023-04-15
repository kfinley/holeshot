//TODO: move this to Core service and deploy an IaC Core Construct for resources
import { DynamoDBClient, DeleteItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { injectable, Container } from "inversify-props";
import { Command } from "@holeshot/commands/src";
import { marshall } from '@aws-sdk/util-dynamodb';
import { PutEntityCommand } from './put-entity';
import { GetEntityCommand } from './get-entity';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type DeleteEntityRequest = {
  pk: string;
  sk: string;
  container: Container
}

export type DeleteEntityResponse = {
  success: boolean;
}

@injectable()
export class DeleteEntityCommand implements Command<DeleteEntityRequest, DeleteEntityResponse> {

  // @Inject("DynamoDBClient")DynamoDBClient
  private ddbClient!: DynamoDBClient;

  async runAsync(params: DeleteEntityRequest): Promise<DeleteEntityResponse> {
    console.log(JSON.stringify(params));

    this.ddbClient = params.container.get<DynamoDBClient>("DynamoDBClient");
    const getCmd = params.container.get<GetEntityCommand>("GetEntityCommand");

    const getItem = await getCmd.runAsync({
      pk: params.pk,
      sk: params.sk,
      container: params.container
    });

    if (getItem.item) {
      const item = getItem.item;

      console.log(item);

      item.PK.S = `${item.PK.S}#DELETED`;

      const putItem = await this.ddbClient.send(new PutItemCommand({
        TableName,
        Item: item
      }));

      const deleteItem = await this.ddbClient.send(new DeleteItemCommand({
        TableName,
        Key: {
          PK: {
            S: params.pk
          },
          SK: {
            S: params.sk
          }
        }
      }));

      return {
        success: deleteItem.$metadata.httpStatusCode == 200 && putItem.$metadata.httpStatusCode == 200
      };
    } else {
      return {
        success: false
      };
    }
  }
}
