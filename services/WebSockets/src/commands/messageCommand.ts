import { Container } from "inversify-props";

export type MessageCommandProps = {
  connectionId: string
};

export interface IMessageCommand {

  runAsync(props: MessageCommandProps): Promise<any>;
}
