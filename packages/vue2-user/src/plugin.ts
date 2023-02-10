import Vue from "vue";
import { Store } from "vuex";
import {
  initializeModules,
  UserState,
  AuthStatus,
  registrationModule,
  userModule,
} from "./store";
import { RegistrationModule, UserModule } from "./store/store-modules";
import NotificationModule from "@finley/vue2-components/src/store/notification-module";
import ComponentLibraryPlugin from "@finley/vue2-components/src/plugin";
import { routes, RouteNames } from "./router";
import { getModule } from "vuex-module-decorators";
import { authHelper } from "@holeshot/api-client/src/helpers";
import bootstrapper from "./bootstrapper";
import { ClientPlugin } from "@finley/vue2-components/src/types";
import { ClientPluginOptions } from "@finley/vue2-components/src/plugin";
import { Container } from "inversify-props";

import "./styles/styles.scss";

export interface UserPluginOptions extends ClientPluginOptions {
  defaultRoute: string;
  loginRedirectRouteName: string;
  postAuthFunction: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupModules = (store: Store<any>, container: Container): void => {
  store.registerModule("Registration", RegistrationModule);
  store.registerModule("User", UserModule);
  store.registerModule("WebSockets", WebSocketsModule);

  initializeModules(store);

  container.bind<UserModule>("UserModule").toDynamicValue(() => userModule);
  container
    .bind<RegistrationModule>("RegistrationModule")
    .toDynamicValue(() => registrationModule);
};

const userPlugin: ClientPlugin = {
  install(vue: typeof Vue, options?: UserPluginOptions | ClientPluginOptions) {
    //TODO: seems lame....
    if (options !== undefined && options.store && options.router) {
      const userOptions = options as UserPluginOptions; //lame...

      // conveniently using the NotificationModule as a check to see if we've registered the ComponentsPlugin
      if (getModule(NotificationModule, options.store) === undefined) {
        vue.use(ComponentLibraryPlugin, {
          router: options.router,
          store: options.store,
          container: options.container,
        });
      }

      setupModules(options.store, options.container);

      bootstrapper(options.container);

      userModule.mutate(
        (state: UserState) =>
          (state.postAuthFunction = userOptions.postAuthFunction)
      );

      routes.forEach((route) => options.router.addRoute(route));

      options.router.beforeEach(async (to, from, next) => {
        await (options.store as any).restored;
        if ((options.store.state.User as UserState).authTokens) {
          userModule.mutate((s) => {
            s.authStatus = AuthStatus.LoggedIn;
          });

          //TODO: deal with this stuff....
          authHelper.authToken = () => {
            return (options.store.state.User as UserState).authTokens
              ?.accessToken as string;
          };
          authHelper.refreshToken = () => {
            return (options.store.state.User as UserState).authTokens
              ?.refreshToken as string;
          };
          authHelper.username = () => {
            return (options.store.state.User as UserState).currentUser
              ?.username as string;
          };
        }

        const authStatus = (<UserState>options.store.state.User).authStatus;

        if (to.meta?.allowAnonymous) {
          if (
            authStatus === AuthStatus.LoggedIn &&
            to.name === RouteNames.Login
          ) {
            next("/");
          } else {
            next();
          }
          return;
        }

        switch (authStatus) {
          case AuthStatus.LoggingIn:
          case AuthStatus.LoginFailed:
            next({ name: RouteNames.Login });
            return;
          case AuthStatus.Registering:
            next({ name: RouteNames.Register });
            return;
          case AuthStatus.LoggedIn:
            if (to.name === RouteNames.Login) {
              next({ name: userOptions.loginRedirectRouteName });
              return;
            }
            next();
            return;
          case AuthStatus.LoggedOut:
            if (to.name === RouteNames.Login) {
              next();
              return;
            }
            next({ name: userOptions.defaultRoute });
            return;
          default:
            next({ name: userOptions.defaultRoute });
        }
      });

      options.store.watch(
        () => (<UserState>options.store.state.User).authStatus,
        (newValue) => {
          if (options.router.currentRoute.name === null) {
            return;
          }

          switch (newValue) {
            case AuthStatus.LoggedIn:
              if (
                options.router.currentRoute.name !==
                userOptions.loginRedirectRouteName
              ) {
                options.router.push({
                  name: userOptions.loginRedirectRouteName,
                });
              }
              break;
            case AuthStatus.LoggingIn:
            case AuthStatus.LoginFailed:
              if (
                options.router.currentRoute.name === RouteNames.Login ||
                options.router.currentRoute.name === RouteNames.SetPassword
              ) {
                return;
              }
              options.router.push({ name: RouteNames.Login });
              break;
            case AuthStatus.NewPasswordRequired:
            case AuthStatus.SettingPassword:
              if (options.router.currentRoute.name === RouteNames.SetPassword) {
                return;
              }
              options.router.push({ name: RouteNames.SetPassword });
              break;
            case AuthStatus.Registering:
              if (options.router.currentRoute.name === RouteNames.Register) {
                return;
              }
              options.router.push({ name: RouteNames.Register });
              break;
            default:
              options.router.push({ name: RouteNames.Login });
              break;
          }
        }
      );
    }
  },
};

export default userPlugin;
