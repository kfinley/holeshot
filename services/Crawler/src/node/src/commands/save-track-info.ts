
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { Track } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand } from '@holeshot/aws-commands/src/getStoredObject'
import { Inject, injectable } from 'inversify-props';
import { convertTrackToItem, convertEventToItem } from './ddb-helpers';
import { container } from './../commands/inversify.config';

//TODO: do this smarter
const TableName = process.env.HOLESHOT_CORE_TABLE as string;
const bucketName = process.env.BUCKET_NAME as string;

export type SaveTrackInfoCommandRequest = {
  keys: string[]
}

export type SaveTrackInfoCommandResponse = {
  success: boolean;
}

@injectable()
export class SaveTrackInfoCommand implements Command<SaveTrackInfoCommandRequest, SaveTrackInfoCommandResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  @Inject("GetStoredObjectCommand")
  private getStoredObjectCommand!: GetStoredObjectCommand;

  async runAsync(params: SaveTrackInfoCommandRequest): Promise<SaveTrackInfoCommandResponse> {

    console.log('ddbClient', this.ddbClient);
    console.log('getStoredObjectCommand', this.getStoredObjectCommand);

    const items: any[] = [];

    for (const key in params.keys) {

      var trackInfo = JSON.parse((await this.getStoredObjectCommand.runAsync({
        container,
        bucket: bucketName,
        key: key
      })).body) as Track;

      console.log(trackInfo);

      const trackItem = convertTrackToItem(trackInfo.name, trackInfo);
      items.push(trackItem);

      // var response = await this.ddbClient.send(new PutItemCommand({
      //   TableName,
      //   trackItem
      // }));
      // items.push(response.$metadata.httpStatusCode);

      trackInfo.events.forEach(async event => {
        const eventItem = convertEventToItem(trackInfo.name, event);
        console.log('event', JSON.stringify(eventItem));
        items.push(eventItem);
        // var response = await this.ddbClient.send(new PutItemCommand({
        //   TableName,
        //   eventItem
        // }));
        // items.push(response.$metadata.httpStatusCode);
      });

    };

    console.log('items', JSON.stringify(items));

    return {
      success: true
    }
  }
}
