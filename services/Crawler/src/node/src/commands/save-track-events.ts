
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Inject, injectable } from 'inversify-props';
import { Event } from '@holeshot/types/src';
import { Command } from '@holeshot/commands/src';
import { GetStoredObjectCommand } from '@holeshot/aws-commands/src/getStoredObject'
import { convertEventToItem } from './ddb-helpers';
import { container } from './../commands/inversify.config';
import { PublishMessageCommand } from '@holeshot/aws-commands/src';

const TableName = process.env.HOLESHOT_CORE_TABLE as string;
const bucketName = process.env.BUCKET_NAME as string;

export type SaveTrackEventsCommandRequest = {
  key: string
}

export type SaveTrackEventsCommandResponse = {
  success: boolean;
}

@injectable()
export class SaveTrackEventsCommand implements Command<SaveTrackEventsCommandRequest, SaveTrackEventsCommandResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  @Inject("GetStoredObjectCommand")
  private getStoredObjectCommand!: GetStoredObjectCommand;

  async runAsync(params: SaveTrackEventsCommandRequest): Promise<SaveTrackEventsCommandResponse> {

    console.log('params', params);
    const items: any[] = [];
    console.log('key', params.key);

    console.log(`Key: ${params.key} BucketName: ${bucketName}`);

    var getTrackEvents = await this.getStoredObjectCommand.runAsync({
      container,
      bucket: bucketName,
      key: params.key
    });

    var trackEvents = JSON.parse(getTrackEvents.body);

    trackEvents.forEach(event => {
      console.log('trackEvent', event);
      const eventItem = convertEventToItem(trackEvents.name, event);

      console.log('eventItem', eventItem);

      items.push(eventItem);
    });


    // var response = await this.ddbClient.send(new PutItemCommand({
    //   TableName,
    //   trackItem
    // }));
    // items.push(response.$metadata.httpStatusCode);

    // trackEvents.events.forEach(async event => {
    //   const eventItem = convertEventToItem(trackEvents.name, event);
    //   console.log('event', JSON.stringify(eventItem));
    //   items.push(eventItem);
    //   // var response = await this.ddbClient.send(new PutItemCommand({
    //   //   TableName,
    //   //   eventItem
    //   // }));
    //   // items.push(response.$metadata.httpStatusCode);
    // });

    console.log('items', JSON.stringify(items));

    await container.get<PublishMessageCommand>("PublishMessageCommand").runAsync({
      topic: 'Holeshot-TrackEventsSavedTopic',
      subject: 'Crawler/trackEventsSaved',
      message: JSON.stringify({

      }),
      container
    });

    return {
      success: true
    }
  }
}
