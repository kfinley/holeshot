import { Story } from "@storybook/vue/types-6-0";
import EventCard from "@/components/event-card.vue";

export default {
  title: "Components/Holeshot/Controls/Event Card",
  parameters: {
    layout: "centered",
  },
};

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(args),
  components: { EventCard },
  template: '<event-card v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
  event: {
    id: "e3e291cc-76ef-4b77-9238-7797936468af",
    name: "Practice",
    trackName: "Rock Hill BMX Supercross Track",
    date: "2023-03-02T00:00:00",
    url: "www.usabmx.com/tracks/1971/events/493331",
    eventType: "Practice",
    details: {
      registrationStart: "4:00 PM",
      registrationEnd: "8:00 PM",
      raceTime: "4:00 PM",
      type: "Practice",
      description: "$5 USA BMX Practice 4-8PM",
      fee: "$5.00 USD",
    },
  },
  track: {
    id: "4680c24d-14e3-4440-83e0-662d07b5c4f9",
    name: "Rock Hill BMX Supercross Track",
    district: "SC01",
    location: {
      address: {
        line1: "1307 Riverwalk Parkway",
        line2: "",
        city: "Rock Hill",
        state: "SC",
        zipCode: "29730",
      },
    },
  },
};
