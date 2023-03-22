<template>
  <div class="events">
    <event-list :events="upcomingEvents" @event-click="eventClick" />
    <event-details-modal
      v-if="showEventDetails"
      :event="currentEvent"
      @close="eventDetailsClosed"
    />
    <event-search />
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BaseControl from "./base-control";
import EventSearch from "./event-search.vue";
import EventList from "./event-list.vue";
import { schedulerModule, SchedulerState } from "../store";
import EventDetailsModal from "./event-details-modal.vue";
import { State } from "vuex-class";
import { Event } from "@holeshot/types/src";

@Component({
  components: {
    EventDetailsModal,
    EventList,
    EventSearch,
  },
})
export default class Schedule extends BaseControl {
  @State("Scheduler") state!: SchedulerState;

  showEventDetails = false;

  currentEvent!: Event;

  get upcomingEvents() {
    return schedulerModule.upcomingEvents;
  }

  eventDetailsClosed() {
    this.currentEvent = null;
    this.showEventDetails = false;
  }

  eventClick(event: Event) {
    this.currentEvent = event;
    this.showEventDetails = true;
  }

  created() {
    // Example of lazy local testing... yes it's lame but quick and easy. :)
    this.state.schedule = [
      {
        id: "e3e291cc-76ef-4b77-9238-7797936468af",
        name: "Practice",
        trackName: "Rock Hill BMX Supercross Track",
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
              postalCode: "29730",
            },
            gps: { lat: "35.990255", long: "-80.418645" },
            mapLink:
              "http://maps.google.com/maps?q=35.990255,-80.418645&iwloc=A&iwd=1",
          },
        },
        date: "2023-03-25T00:00:00",
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
    ];
  }
}
</script>

<style lang="scss" scoped>
.events {
}

@media (max-width: 768px) {
  .events {
  }
}
</style>
