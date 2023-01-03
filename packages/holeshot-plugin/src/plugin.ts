import Vue, { PluginFunction, PluginObject } from "vue";
import * as components from './components';

export interface HoleshotPlugin extends PluginObject<HoleshotPluginOptions> {
  install: PluginFunction<HoleshotPluginOptions>;
}

export interface HoleshotPluginOptions {}


const HoleshotPluginPlugin = {
  install(vue: typeof Vue, options?: HoleshotPluginOptions) {
        Object.keys(components).forEach(name => {
            vue.component(name, (<any>components)[name]);
        });
    }
};

export default HoleshotPluginPlugin;
