import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type GetUserCommandRequest = {
  email: string
}

export type GetUserCommandResponse = {
  userId?: string
}

@injectable()
export class GetUserCommand implements Command<GetUserCommandRequest, GetUserCommandResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: GetUserCommandRequest): Promise<GetUserCommandResponse> {

    //console.log('GetUserCommand', TableName)

    const query = {
      TableName,
      ExpressionAttributeValues: marshall({
        ":PK": `USER#${params.email}`
      }),
      KeyConditionExpression: "PK = :PK"
    };

    const data = await this.ddbClient.send(new QueryCommand(query));

    if (data.Items && data.Count && data.Count > 0) {
      return {
        userId: data.Items[0].id.S
      }
    }

    // console.log('No user found...');

    return {};
  }
}
