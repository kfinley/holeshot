import { Story } from '@storybook/vue/types-6-0';
import Schedule from '@/components/schedule.vue';

export default {
  title: 'Components/Holeshot/Schedule',
  parameters: {
    layout: 'centered'
  }
}

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(args),
  components: { Schedule },
  template: '<schedule v-bind="$props" />',
});


export const Default = Template.bind({});
Default.args = {};
