import Vuex from 'vuex';
import { Story } from "@storybook/vue/types-6-0";
import EventSearch from "@/components/event-search.vue";
import { events } from "../../tests/data";
import { initializeModules }  from "@/store/initialize-modules";
import { SearchModule } from "@/store/search-store";

export default {
  title: "Components/Holeshot/Event Search",
  parameters: {
    layout: "centered",
  },
};

const store = new Vuex.Store({
  plugins: [initializeModules],
  modules: {
    Search: SearchModule,
  },
});

const Template: Story = (args, { argTypes }) => ({
  components: { EventSearch },
  props: Object.keys(args),
  store,
  template: '<event-search v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
  items: events,
};
