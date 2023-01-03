
import bootstrapper from "./../bootstrapper";
import Vue from "vue";
import { Store } from "vuex";
import { ArticlesModule } from '../store/articles-module'
import { setupValidation } from '@finley/vue2-components/src/components/validation';
import { extend } from 'vee-validate';
import { ClientPlugin, ClientPluginOptions } from '@finley/vue2-components/src/types';
import ComponentLibraryPlugin from '@finley/vue2-components/src/plugin';
import UserPlugin from '@holeshot/vue2-user/src/plugin';
import VuexPersist from "vuex-persist";
import { RouteNames } from "./../router/RouteNames";
import { NotificationState } from "@finley/vue2-components/src/store/state";
import { RegistrationState, UserState } from "@holeshot/vue2-user/src/store";

//Move these maybe??
import "bootstrap/dist/css/bootstrap.css";
import "../styles/styles.scss";

export const setupModules = (store: Store<any>): void => {
  store.registerModule("Articles", ArticlesModule)
};

const plugin: ClientPlugin = {
  install(vue: typeof Vue, options?: ClientPluginOptions) {
    if (options !== undefined && options.router && options.store) {
      const appName = options.appName ?? "Holeshot-BMX.com";

      bootstrapper(options.store);

      setupValidation(extend);
      setupModules(options.store);

      vue.use(ComponentLibraryPlugin, {
        appName: options.appName,
        router: options.router,
        store: options.store,
        container: options.container
      });

      vue.use(UserPlugin, {
        router: options.router,
        store: options.store,
        LoginRedirectRouteName: RouteNames.Dashboard,
        DefaultRoute: RouteNames.Home,
        container: options.container
      });

      // router provided to add any plugin routes.
      // i.e. options.router.addRoutes(routes);

      const vuexLocalStorage = new VuexPersist({
        key: appName, // The key to store the state on in the storage provider.
        storage: window.localStorage, // or window.sessionStorage or localForage
        // Function that passes the state and returns the state with only the objects you want to store.
        reducer: (state: { Notification: NotificationState, Registration: RegistrationState, User: UserState }) => ({
          User: {
            authTokens: state.User.authTokens,
            currentUser: state.User.currentUser
          }
        }),
        // Function that passes a mutation and lets you decide if it should update the state in localStorage.
        // filter: (mutation) => true
      });

      vuexLocalStorage.plugin(options.store);

    }
  },
};

export default plugin;
