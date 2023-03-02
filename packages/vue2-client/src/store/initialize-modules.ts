import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import { WebSocketsModule } from './ws-module';

let webSocketsModule: WebSocketsModule;

export function initializeModules(store: Store<any>): void {
  webSocketsModule = getModule(WebSocketsModule, store);
}

export { webSocketsModule };
