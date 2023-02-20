import { Inject, injectable } from 'inversify-props';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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

    let body: string | undefined;

    try {

      console.log('config', await this.s3Client.config.credentials());
      console.log('endpoint', await this.s3Client.config.endpoint?.());

      const command = new GetObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      });

      try {

        const s3Item = await this.s3Client.send(command);

        body = await this.streamToString(s3Item.Body as Readable);

        console.log('trackInfo.json', body);

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
