
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
// import { marshall } from '@aws-sdk/util-dynamodb';
import { Track } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { convertTrackToItem } from './ddb-helpers';

//TODO: do this smarter
const TableName = process.env.HOLESHOT_CORE_TABLE as string;

export type SaveTrackInfoCommandRequest = {
  track: Track
}

export type SaveTrackInfoCommandResponse = {
  success: boolean;
}

@injectable()
export class SaveTrackInfoCommand implements Command<SaveTrackInfoCommandRequest, SaveTrackInfoCommandResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: SaveTrackInfoCommandRequest): Promise<SaveTrackInfoCommandResponse> {

    //console.log('LoadTrackInfoCommand', TableName)

    const Item = convertTrackToItem('SYSTEM', params.track);

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
