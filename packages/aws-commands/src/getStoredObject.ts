import { Inject, injectable } from 'inversify-props';
import { S3, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Command } from '@holeshot/commands/src';
import { Container } from 'inversify-props';
import { Readable } from 'stream';

export interface GetStoredObjectRequest {
  bucket: string;
  key: string;
  container: Container;
}

export interface GetStoredObjectResponse {
  body: string | undefined;
}

@injectable()
export class GetStoredObjectCommand implements Command<GetStoredObjectRequest, GetStoredObjectResponse> {

  // @Inject("S3Client") // Still not working...
  private s3Client!: S3Client;

  private async streamToString(stream: Readable): Promise<string> {
    return await new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
  }

  async runAsync(params: GetStoredObjectRequest): Promise<GetStoredObjectResponse> {

    console.log('GetStoredObjectRequest', JSON.stringify(params));

    this.s3Client = params.container.get<S3Client>("S3Client");

    // https://github.com/aws/aws-sdk-js-v3/issues/1877#issuecomment-755387549
    // const streamToString = (stream: any): Promise<string> =>
    //   new Promise((resolve, reject) => {
    //     const chunks: any[] = [];
    //     stream.on("data", (chunk: any) => chunks.push(chunk));
    //     stream.on("error", reject);
    //     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    //   });
    // Apparently the stream parameter should be of type Readable|ReadableStream|Blob
    // The latter 2 don't seem to exist anywhere.

    let body: string | undefined;

    try {

      console.log('config', await this.s3Client.config.credentials());
      console.log('endpoint', await this.s3Client.config.endpoint);

      const data = await this.s3Client.send(new GetObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      }));

      console.log('data', data);

      try {
        body = await this.streamToString(data.Body as Readable);
        console.log('streamToString', body);
      } catch (e) {
        console.log('error', e);
      }

      try {
        body = await data.Body?.transformToString();
        console.log('transformToString', body);
      } catch (e) {
        console.log('error', e);
      }

    } catch (e) {
      console.log('Error: ', e);
    }

    return {
      body
    };

  }
}
