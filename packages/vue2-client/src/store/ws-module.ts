import { Module, Action, getModule } from 'vuex-module-decorators';
import { WebSocketsState, WebSocketsStatus } from './state';
import Sockette from 'sockette';
import { Socket } from '../types';
import BaseModule from './base-module';
import { Store } from 'vuex';
import { config } from '@holeshot/web-core/src/config';

@Module({ name: 'WebSockets', namespaced: true })
export class WebSocketsModule extends BaseModule implements WebSocketsState {
  status: WebSocketsStatus = WebSocketsStatus.None;
  socket!: Socket;

  wsUrl = `${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://${config.WebSocket}`;

  @Action
  handleSocketMessage(ev: MessageEvent) {
    try {
      const { subject, message } = JSON.parse(ev.data);
      this.context.dispatch(subject, message, { root: true });
    } catch (e) {
      console.log(e);
    }
  }

  @Action
  sendCommand(params: { command: string; data: unknown }) {
    console.log('sendCommand', params);

    this.context.commit('mutate', (state: WebSocketsState) => {
      state.socket?.send(
        JSON.stringify({
          command: params.command,
          data: params.data,
        })
      );
    });
  }

  @Action
  handleSocketClose(ev: CloseEvent) {
    console.log('handleSocketClose', ev);
  }

  @Action
  connect(token: string) {
    console.log('connect');

    if (this.socket == undefined) {
      console.log(`connecting to socket: ${this.wsUrl}`);
      const socket = new Sockette(this.wsUrl, {
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
  connected(params: { userId: string }) {
    console.log(params);
    console.log('connected');
    this.context.commit(
      'mutate',
      (state: WebSocketsState) => (state.status = WebSocketsStatus.Connected)
    );
  }
}

export const getWSModule = (store: Store<any>) => getModule(WebSocketsModule, store);
