import Vue, { PluginFunction, PluginObject } from "vue";
import * as components from './components';
import { ClientPluginOptions } from '@finley/vue2-components/src/plugin';
import { Container } from "inversify-props";
import { SearchModule } from "./store/search-store";
import { initializeModules } from "./store";
import { Store } from "vuex";

export interface HoleshotPlugin extends PluginObject<HoleshotPluginOptions> {
  install: PluginFunction<HoleshotPluginOptions>;
}

export type HoleshotPluginOptions = ClientPluginOptions;

export const setupModules = (store: Store<any>, container: Container): void => {
  store.registerModule('Search', SearchModule);

  initializeModules(store);

  // container.bind<SearchModule>('SearchModule').toDynamicValue(() => searchModule);

};


const HoleshotPlugin = {
  install(vue: typeof Vue, options?: HoleshotPluginOptions) {
    Object.keys(components).forEach(name => {
      vue.component(name, (<any>components)[name]);
    });
    if (options !== undefined) {
      setupModules(options.store, options.container);
    }
  }
};

export default HoleshotPlugin;
