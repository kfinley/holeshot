import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { SendMessageCommand } from './sendMessage';
import { Container } from 'inversify-props';
import { MessageCommandProps } from './messageCommand';

export type PingMessageRequest = {
  connectionId: string,
  container: Container
};

export type PingMessageResponse = {
  success: boolean;
};

@injectable()
export class PingMessageCommand implements Command<PingMessageRequest, PingMessageResponse> {

  // @Inject("SendMessageCommand")
  private sendMessageCmd!: SendMessageCommand;

  async runAsync(params: PingMessageRequest): Promise<PingMessageResponse> {

    this.sendMessageCmd = params.container.get<SendMessageCommand>("SendMessageCommand");

    await this.sendMessageCmd.runAsync({
      connectionId: params.connectionId,
      data: JSON.stringify({
        subject: 'pong'
      })
    });

    return {
      success: true
    };
  };

}
