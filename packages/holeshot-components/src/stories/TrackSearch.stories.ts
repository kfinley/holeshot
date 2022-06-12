import { Story } from '@storybook/vue/types-6-0';
import TrackSearch from '@/components/track-search.vue';
import { tracks } from './data';

export default {
  title: 'Components/Holeshot/Track Search',
  parameters: {
    layout: 'centered'
  }
}

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(args),
  components: { TrackSearch },
  template: '<track-search v-bind="$props" />',
});


export const Default = Template.bind({});
Default.args = {
  items: tracks
}
