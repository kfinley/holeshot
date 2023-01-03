import { Story } from '@storybook/vue/types-6-0';
import EventsFeed from '@/components/events-feed.vue';
import { SwipeableEvent } from '@holeshot/types/src/index';
import { events } from '../../tests/data'

export default {
  title: 'Components/Holeshot/Events Feed'
};

let testEvents = events;

const DefaultTemplate: Story = (args, { updateArgs }) => ({
  components: { EventsFeed },
  props: Object.keys(args),
  template:
    `<events-feed
      v-bind="$props"
      @draggedComplete="dragged"
      @outOfSight="out"
      >
    </events-feed>`,
  methods: {
    dragged(draggedArgs: { handleDragged: any, dragged: { direction: string, id: any } }) {
      testEvents = draggedArgs.handleDragged(testEvents, draggedArgs.dragged);
      updateArgs({ ...args, events });
    },
    out(draggedArgs: {
      outOfSightHandle: (events: Array<SwipeableEvent>, item: SwipeableEvent) => Array<SwipeableEvent>,
      item: SwipeableEvent
    }) {
      //console.log('out');
      // handle item here then call func to remove the item
      testEvents = draggedArgs.outOfSightHandle(testEvents, draggedArgs.item);
      updateArgs({ ...args, events });
    }
  }
});


const save = (savedId: string) => {
  console.log(savedId);
  testEvents = testEvents.filter(item => !savedId.includes(item.id));
  // forceReRender();
  DefaultTemplate.bind({})
};

const skip = (skippedId: string) => {
  console.log(skippedId);
  testEvents = testEvents.filter(item => !skippedId.includes(item.id));
  console.log(testEvents.length);
  // forceReRender();
  DefaultTemplate.bind({})
};

export const Default = DefaultTemplate.bind({});
Default.args = {
  events: testEvents,
  save,
  skip
};
