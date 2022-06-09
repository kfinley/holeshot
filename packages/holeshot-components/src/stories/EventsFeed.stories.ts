import { Story } from '@storybook/vue/types-6-0';
import EventsFeed from '@/components/events-feed.vue';
import { SwipeableEvent } from '@holeshot/types/src/index';

export default {
  title: 'Components/Holeshot/EventsFeed'
};

let events = [
  {
    id: 'e3e291cc-76ef-4b77-9238-7797936468af',
    name: 'Practice',
    date: new Date('Wednesday, June 1, 2022'),
    url: 'www.usabmx.com/tracks/1971/events/493331',
    details: [
      ['Registration Start', '4:00 PM'],
      ['Registration End', '8:00 PM'],
      ['Race Time', '4:00 PM'],
      ['Type', 'Practice'],
      ['Description', '$5 USA BMX Practice 4-8PM'],
      ['Fee', '$5.00 USD']
    ],
    track: {
      id: '4680c24d-14e3-4440-83e0-662d07b5c4f9',
      name: 'Rock Hill BMX Supercross Track',
      address: {
        line1: '1307 Riverwalk Parkway',
        line2: '',
        city: 'Rock Hill',
        state: 'SC',
        zipcode: 29730
      },
    },
    visible: true
  },
  {
    id: '62677bcb-7400-40ad-84c7-67d6ddee5688',
    name: 'Local Race Single',
    date: new Date('Friday, June 3, 2022'),
    url: 'www.usabmx.com/tracks/1971/events/493332',
    details: [
      ['Registration Start', '6:00 PM'],
      ['Registration End', '7:30  PM'],
      ['Race Time', '8:00 PM'],
      ['Type', ' Local Race'],
      ['Description', '$10 Friday Night Single Points Race.Practice &amp; on-site Registration open at 6PM. Online Pre-reg opens on Monday and closes at 5PM Race Day'],
      ['Fee', '$10.00 USD']
    ],
    track: {
      id: '4680c24d-14e3-4440-83e0-662d07b5c4f9',
      name: 'Rock Hill BMX Supercross Track',
      address: {
        line1: '1307 Riverwalk Parkway',
        line2: '',
        city: 'Rock Hill',
        state: 'SC',
        zipcode: 29730
      },
    },
    visible: true
  },
  {
    id: '3d4dcdd0-9c08-4622-ba2c-188f00534d8a',
    name: 'Practice',
    date: new Date('Saturday, June 4, 2022'),
    url: 'www.usabmx.com/tracks/1971/events/493333',
    details: [
      ['Registration Start', '11:00 AM'],
      ['Registration End', '2:00 PM'],
      ['Race Time', '11 00 AM'],
      ['Type', 'Practice'],
      ['Description', '$5 USA BMX Practice 4-8PM'],
      ['Fee', '$5.00 USD']
    ],
    track: {
      id: '4680c24d-14e3-4440-83e0-662d07b5c4f9',
      name: 'Rock Hill BMX Supercross Track',
      address: {
        line1: '1307 Riverwalk Parkway',
        line2: '',
        city: 'Rock Hill',
        state: 'SC',
        zipcode: 29730
      },
    },
    visible: true
  }
] as Array<SwipeableEvent>;

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
    dragged(args: { handleDragged: any, dragged: { direction: string, id: any } }) {
      events = args.handleDragged(events, args.dragged);
      updateArgs({ ...args, events });
    },
    out(args: {
      outOfSightHandle: (events: Array<SwipeableEvent>, item: SwipeableEvent) => Array<SwipeableEvent>,
      item: SwipeableEvent
    }) {
      //console.log('out');
      // handle item here then call func to remove the item
      events = args.outOfSightHandle(events, args.item);
      updateArgs({ ...args, events });
    }
  }
});


const save = (savedId: string) => {
  console.log(savedId);
  events = events.filter(item => !savedId.includes(item.id));
  // forceReRender();
  DefaultTemplate.bind({})
};

const skip = (skippedId: string) => {
  console.log(skippedId);
  events = events.filter(item => !skippedId.includes(item.id));
  console.log(events.length);
  // forceReRender();
  DefaultTemplate.bind({})
};

export const Default = DefaultTemplate.bind({});
Default.args = {
  events,
  save,
  skip
};
