<template>
  <div v-if="events.length > 0">
    <div v-for="(event, index) in events" :key="index">
      <event-card :track="event.track" :event="event" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Event } from "@holeshot/types/src";
import EventCard from "./event-card.vue";

@Component({
  components: {
    EventCard,
  },
})
export default class EventList extends Vue {
  @Prop()
  events: Array<Event>;
}
</script>
