<template>
  <div class="row">
    <div>
      <h3 align="center">Upcoming Events</h3>
      <div v-for="(event, index) in events" :key="index">
        <event-card
          :track="event.track"
          :event="event"
          @click="click(event)"
          class="clickable"
        />
      </div>
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
export default class EventsUpcoming extends Vue {
  @Prop()
  events: Array<Event>;

  click(event: Event) {
    this.$emit("event-click", event);
  }
}
</script>
