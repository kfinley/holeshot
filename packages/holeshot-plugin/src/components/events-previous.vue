<template>
  <div class="row">
    <h3 align="center">Previous Events</h3>
    <div class="reversed">
      <div v-for="(event, index) in events" :key="index">
        <event-card :track="event.track" :event="event" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import BaseControl from "./base-control";
import { Event } from "@holeshot/types/src";
import EventCard from "./event-card.vue";

@Component({
  components: {
    EventCard,
  },
})
export default class EventsPrevious extends BaseControl {
  @Prop()
  events: Array<Event>;
}
</script>

<style lang="scss" scoped>
.reversed {
  display: flex;
  flex-direction: column-reverse;
}
</style>
