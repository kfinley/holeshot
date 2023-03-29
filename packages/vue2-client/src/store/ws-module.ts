import { Module, Action, getModule, Mutation } from 'vuex-module-decorators';
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
  commandQueue: { command: string; data: any; }[] = [];
  token!: string;

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
    const cmd = {
      command: params.command,
      data: params.data,
    };

    if (this.status == WebSocketsStatus.Disconnected) {
      this.context.dispatch('reconnect');
      this.context.commit('queueCommand', cmd);
    } else {
      this.context.commit('mutate', (state: WebSocketsState) => {
        state.socket?.send(
          JSON.stringify({
            command: params.command,
            data: params.data,
          })
        );
      });
    }
  }

  @Action
  handleSocketClose(ev: CloseEvent) {
    if (ev.code == 1000) {
      console.log('closed normally', ev);
    } else if (ev.code == 1001) {
      this.context.commit(
        'mutate',
        (state: WebSocketsState) => (state.status = WebSocketsStatus.Disconnected)
      );
      console.log('WebSocket Disconnected: ', ev);
    } else {
      console.log('WebSocket close: ', ev);
    }
  }

  @Action
  handleSocketMaximum(ev: CloseEvent) {
    console.log('WebSocket maximum reconnects reached: ', ev);
    this.context.dispatch('User/logout', null, { root: true });
  }

  @Action
  connect(token: string) {
    if (this.socket == undefined) {
      this.context.commit(
        'mutate',
        (state: WebSocketsState) => (state.status = WebSocketsStatus.Connecting)
      );
      console.log(`connecting to socket: ${this.wsUrl}`);

      const wsUrl = this.wsUrl;
      const onmessage = this.handleSocketMessage;
      const onclose = this.handleSocketClose;
      const context = this.context;
      const onmaximum = this.handleSocketMaximum;

      new Promise(function (resolve, reject) {
        const socket = new Sockette(wsUrl, {
          protocols: token,
          onmessage,
          // onreconnect?: (this: Sockette, ev: Event | CloseEvent) => any;
          onmaximum,
          onclose,
          onerror: function (this: Sockette, ev: Event) {
            reject(ev);
          },
          timeout: 60000,
          maxAttempts: 3, // -1 for testing b/c it turns of the auto-reconnect features of sockette
        });
        context.commit('mutate', (state: WebSocketsState) => {
          state.socket = socket;
          state.token = token;
        });
      }).catch((err) => {
        console.log('WS Connection Error: ', err);
      });
    }
  }

  @Action
  reconnect(token?: string) {
    this.context.commit('mutate', (state: WebSocketsState) => (state.socket = undefined));
    this.context.dispatch('connect', token ?? this.token);
  }

  @Action
  connected(params: { userId: string }) {
    console.log(params);
    console.log('connected');
    this.context.commit(
      'mutate',
      (state: WebSocketsState) => (state.status = WebSocketsStatus.Connected)
    );

    for (const cmd in this.commandQueue) {
      this.context.commit('mutate', (state: WebSocketsState) => {
        state.socket?.send(JSON.stringify(cmd));
      });
    }
    this.context.commit('mutate', (state: WebSocketsState) => {
      state.commandQueue = [];
    });
  }

  @Mutation
  queueCommand(cmd: { command: string, data: any }) {
    this.commandQueue.push(cmd);
  }
}

export const getWSModule = (store: Store<any>) => getModule(WebSocketsModule, store);
