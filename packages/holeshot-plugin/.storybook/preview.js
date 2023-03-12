import 'reflect-metadata';
import Vue from 'vue'
import Vuex from 'vuex';
import { useArgs } from '@storybook/client-api'
import { action } from '@storybook/addon-actions';

import '!style-loader!css-loader!sass-loader!../node_modules/bootstrap/dist/css/bootstrap.css';
import '!style-loader!css-loader!sass-loader!../node_modules/bootstrap-icons/font/bootstrap-icons.css';

//TODO import '!style-loader!css-loader!sass-loader!xxxxx/src/styles/styles.scss';


Vue.use(Vuex);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

//ht: https://craigbaldwin.com/blog/updating-args-storybook-vue/
export const decorators = [
  (story, context) => {
    const [_, updateArgs] = useArgs();
    return story({ ...context, updateArgs });
  },
]

Vue.component('RouterLink', {
  props: ['to'],
  methods: {
    log() {
      action('link target')(this.to)
    },
  },
  template: '<a href="#" @click.prevent="log()"><slot>RouterLink</slot></a>',
});
