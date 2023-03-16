import { Socket } from '../types'
import { Status } from '@holeshot/plugin/src/store/state';

export { Status }
export interface ArticlesState {
  articles: Record<string, string>;
  status: Status;
}

export enum WebSocketsStatus {
  None = 'None',
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected',
  Failed = 'Failed',
}

export interface WebSocketsState {
  status: WebSocketsStatus;
  socket?: Socket;
}
