import bootstrapper from './../bootstrapper';
import Vue from 'vue';
import { Store } from 'vuex';
import { ArticlesModule, getArticlesModule } from '../store/articles-module';
import { WebSocketsModule } from '../store/ws-module';
import { extend } from 'vee-validate';
import { ClientPlugin } from '@finley/vue2-components/src/types';
import ComponentLibraryPlugin, {
  ClientPluginOptions,
} from '@finley/vue2-components/src/plugin';
import UserPlugin from '@holeshot/vue2-user/src/plugin';
import VuexPersist from 'vuex-persist';
import { RouteNames } from './../router/RouteNames';
import { NotificationState } from '@finley/vue2-components/src/store/state';
import { AuthStatus, RegistrationState, UserState } from '@holeshot/vue2-user/src/store';
import { setupValidation } from '@finley/vue2-components/src/components/validation';
import HoleshotPlugin from '@holeshot/plugin/src/plugin';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@holeshot/vue2-user/src/store/user-module';
import { SearchModule } from '@holeshot/plugin/src/store/search-store';
import { SchedulerModule } from '@holeshot/plugin/src/store/scheduler-module';
// import { initializeModules } from '../store';
import '../styles/styles.scss';
import { SchedulerState } from '@holeshot/plugin/src/store';
import RegistrationModule from '@holeshot/vue2-user/src/store/registration-module';
import { RaceLogModule } from '@holeshot/plugin/src/store/race-log-module';

export const setupModules = (store: Store<any>): void => {
  store.registerModule('Articles', ArticlesModule);
  store.registerModule('WebSockets', WebSocketsModule);

  //HACK: Calls to Vuex.registerModule inside plugins will wipe out the store getters.
  //      so we must call getModule for any module that got wiped out.
  //      https://github.com/vuejs/vuex/blob/d65d14276e87aca17cfbd3fbf4af9e8dbb808f24/src/store.js#L265
  //      https://github.com/championswimmer/vuex-module-decorators/issues/250
  //
  // load up the modules so they are in the store root.
  // WebSockets is loaded below
  getModule(SchedulerModule, store);
  getArticlesModule(store);
  getModule(UserModule, store);
  getModule(RegistrationModule, store);
  getModule(SearchModule, store);
  getModule(RaceLogModule, store);

  // initializeModules(store);
};

const plugin: ClientPlugin = {
  install(vue: typeof Vue, options?: ClientPluginOptions) {
    if (options !== undefined && options.router && options.store) {
      const appName = options.appName ?? 'Holeshot-BMX.com';

      bootstrapper(options.store);

      setupValidation(extend);

      vue.use(ComponentLibraryPlugin, {
        appName: options.appName,
        router: options.router,
        store: options.store,
        container: options.container,
      });

      vue.use(UserPlugin, {
        router: options.router,
        store: options.store,
        loginRedirectRouteName: RouteNames.Scheduler,
        defaultRoute: RouteNames.Home,
        container: options.container,
      });

      vue.use(HoleshotPlugin, {
        router: options.router,
        store: options.store,
        container: options.container,
      });

      setupModules(options.store);
      const webSocketsModule = getModule(WebSocketsModule, options.store);

      // router provided to add any plugin routes.
      // i.e. options.router.addRoutes(routes);

      options.router.beforeEach(async (to, from, next) => {
        const userState = <UserState>options.store.state.User;

        await (options.store as any).restored;

        if (
          userState.authStatus == AuthStatus.LoggedIn &&
          userState.authTokens?.accessToken
        ) {
          if (webSocketsModule.status !== 'Connected') {
            webSocketsModule.connect(userState.authTokens?.accessToken);
          }
        }
        next();
      });

      options.store.watch(
        () => (<UserState>options.store.state.User).authStatus,
        (newValue) => {
          if (options.router.currentRoute.name === null) {
            return;
          }

          switch (newValue) {
            case AuthStatus.LoggedIn:
              break;
            default:
              // Can hook in commands to run at logout here
              break;
          }
        }
      );

      const vuexLocalStorage = new VuexPersist({
        key: appName, // The key to store the state on in the storage provider.
        storage: window.localStorage, // or window.sessionStorage or localForage
        // Function that passes the state and returns the state with only the objects you want to store.
        reducer: (state: {
          Notification: NotificationState;
          Registration: RegistrationState;
          User: UserState;
          Scheduler: SchedulerState;
        }) => ({
          User: {
            authTokens: state.User.authTokens,
            authStatus: state.User.authStatus,
          },
          Scheduler: {
            schedule: state.Scheduler.schedule,
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
