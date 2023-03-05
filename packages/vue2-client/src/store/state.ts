import { Socket } from '../types'
import { Event } from '@holeshot/types/src';

export enum Status {
  'None',
  'Loading',
  'Loaded',
  'Failed',
}

export interface ArticlesState {
  articles: Record<string, string>;
  status: Status;
}

export enum WebSocketsStatus {
  'None',
  'Connected',
  'Disconnected',
  'Failed',
}

export interface WebSocketsState {
  status: WebSocketsStatus;
  socket?: Socket;
}

export interface EventsState {
  status: Status;
  myEvents: Event[];
  searchResult: Event[];
}
