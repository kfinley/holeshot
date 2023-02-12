import { Module, Action, getModule } from 'vuex-module-decorators';
import { WebSocketsState, WebSocketsStatus } from './state';
import Sockette from 'sockette';
import { Socket } from '../types';
import BaseModule from './base-module';
import { Store } from 'vuex';

@Module({ name: 'WebSockets', namespaced: true })
export class WebSockets extends BaseModule implements WebSocketsState {
  status: WebSocketsStatus = WebSocketsStatus.None;
  socket!: Socket;

  //TODO: fix this...
  url = `${
    process.env.NODE_ENV === 'production'
      ? 'ws.holeshot-bmx.com' // TODO: do better...
      : 'localhost:3001'
  }`;

  protocol = `${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}`;

  @Action
  handleSocketMessage(ev: MessageEvent) {
    const { subject, message } = JSON.parse(ev.data);
    this.context.dispatch(subject, message, { root: true });
  }

  @Action
  handleSocketClose(ev: CloseEvent) {
    console.log('handleSocketClose', ev);
  }

  @Action
  connect(token: string) {
    console.log('connect');

    const wsUrl = `${this.protocol}://${this.url}`;

    if (this.socket == undefined) {
      console.log(`connecting to socket: ${wsUrl}`);
      const socket = new Sockette(wsUrl, {
        protocols: token,
        onmessage: this.handleSocketMessage,
        // onreconnect?: (this: Sockette, ev: Event | CloseEvent) => any;
        // onmaximum?: (this: Sockette, ev: CloseEvent) => any;
        onclose: this.handleSocketClose,
        //  onerror?: (this: Sockette, ev: Event) => any;
        timeout: 60000,
        maxAttempts: -1, // -1 for testing b/c it turns of the auto-reconnect features of sockette
      });
      this.context.commit('mutate', (state: WebSocketsState) => (state.socket = socket));
    }
  }

  @Action
  connected() {
    console.log('connected');
    this.context.commit(
      'mutate',
      (state: WebSocketsState) => (state.status = WebSocketsStatus.Connected)
    );
  }
}

export const getWSModule = (store: Store<any>) => getModule(WebSockets, store);
