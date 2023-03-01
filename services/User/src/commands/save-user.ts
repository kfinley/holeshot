
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { convertUserToItem } from './ddb-helpers';

//TODO: do this smarter
const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export interface SaveUserRequest {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SaveUserResponse {
  success: boolean
}

@injectable()
export class SaveUserCommand implements Command<SaveUserRequest, SaveUserResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: SaveUserRequest): Promise<SaveUserResponse> {

    if (params.userId == undefined) {
      params["id"] = params.email
    }

    // console.log('params', params);

    const Item = convertUserToItem({
      ...params,
      id: params.email
    });

    // console.log('Item', Item);
    // console.log('TableName', TableName);

    var response = await this.ddbClient.send(new PutItemCommand({
      TableName,
      Item
    }));

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error("Unexpected response in SaveUserCommand");
    }

    return {
      success: true
    }
  }
}
