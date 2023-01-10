// Config should be imported as early as possible
// in order to prevent any missing values.
// TODO: remove when config is reworked.
import "./config";

import Vue from "vue";
import App from "./App.vue";
import ClientPlugin from "./plugins/client";
import { createRouter} from "./router";
import store from "./store";
import { container } from './inversify.config';

Vue.config.productionTip = false;

createRouter().then(router => {
  Vue.use(ClientPlugin, {
    router,
    store,
    container
  });

  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount("#app");
})
