import { Container } from "inversify-props";

export type MessageCommandProps = {
};

export interface IMessageCommand {

  runAsync(props: MessageCommandProps): Promise<any>;
}
