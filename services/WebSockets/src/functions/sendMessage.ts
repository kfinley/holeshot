import { Context, Handler } from 'aws-lambda';
import bootstrapper from './../bootstrapper';
import { SendMessageCommand } from '../commands';

const container = bootstrapper();

export const handler: Handler = async (event: any, context: Context) => {

  const sendMessageCmd = container.get<SendMessageCommand>("SendMessageCommand");

  const { connectionId, subject, message } = event;

  if (message['connectionId']) {
    delete message.connectionId;  // This was added in to know where to send the message back to. Work this out better.... 
  }

  const response = await sendMessageCmd.runAsync({
    connectionId,
    data: JSON.stringify({
      subject,
      message: JSON.parse(message) // message is a string at this point. parse so it's sent as an object
    })
  });

  return {
    statusCode: response.statusCode
  };
};
