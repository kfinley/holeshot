//TODO: move this to Core service and deploy an IaC Core Construct for resources
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { injectable, Container } from "inversify-props";
import { Command } from "@holeshot/commands/src";
import { marshall } from '@aws-sdk/util-dynamodb';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type AddEntityRequest = {
  username: string;
  pk: string;
  sk: string;
  type: string;
  entity: any;
  container: Container
}

export type AddEntityResponse = {
  entity: any
  success: boolean;
}

@injectable()
export class AddEntityCommand implements Command<AddEntityRequest, AddEntityResponse> {

  // @Inject("DynamoDBClient")DynamoDBClient
  private ddbClient!: DynamoDBClient;

  async runAsync(params: AddEntityRequest): Promise<AddEntityResponse> {
    console.log(JSON.stringify(params));

    this.ddbClient = params.container.get<DynamoDBClient>("DynamoDBClient");
    
    var response = await this.ddbClient.send(new PutItemCommand({
      TableName,
      Item: {
        PK: {
          S: params.pk
        },
        SK: {
          S: params.sk
        },
        type: {
          S: params.type
        },
        ...marshall(params.entity)
      }
    }));

    return {
      success: response.$metadata.httpStatusCode == 200,
      entity: params.entity,
    }
  }

}
