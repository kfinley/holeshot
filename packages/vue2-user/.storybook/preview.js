import 'reflect-metadata';
import Vue from 'vue'
import Vuex from 'vuex'
import { setupValidation } from '@vue2-components/src/validation';
import { extend } from 'vee-validate';
import { action } from '@storybook/addon-actions';

import '!style-loader!css-loader!sass-loader!../node_modules/bootstrap/dist/css/bootstrap.css';
import '!style-loader!css-loader!sass-loader!@holeshot/vue2-components/src/styles/styles.scss';

Vue.use(Vuex);
setupValidation(extend);

Vue.component('RouterLink', {
  props:   ['to'],
  methods: {
    log() {
      action('link target')(this.to)
    },
  },
  template: '<a href="#" @click.prevent="log()"><slot>RouterLink</slot></a>',
});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: 'fullscreen',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};


