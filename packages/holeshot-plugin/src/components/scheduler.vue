<template>
  <div class="events pb-3">
    <events-previous
      v-if="activeControl == 'EventsPrevious'"
      :events="previousEvents"
      @event-click="eventClicked"
    />
    <events-upcoming
      v-if="activeControl == 'EventsUpcoming'"
      :events="upcomingEvents"
      @event-click="eventClicked"
    />
    <event-details-modal
      v-if="showEventDetails"
      :event="currentEvent"
      @close="eventDetailsClosed"
      @open-race-log="openRaceLog"
    />
    <event-search v-if="activeControl == 'EventsSearch'" />
    <scheduler-controls @click="controlsClicked" />
    <race-log-modal
      v-if="showRaceLog"
      :event="currentEvent"
      @close="raceLogClosed"
    />
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BaseControl from "./base-control";
import EventSearch from "./event-search.vue";
import EventsUpcoming from "./events-upcoming.vue";
import EventsPrevious from "./events-previous.vue";
import { schedulerModule, SchedulerState } from "../store";
import EventDetailsModal from "./event-details-modal.vue";
import SchedulerControls from "./scheduler-controls.vue";
import { State } from "vuex-class";
import { Event, Actions } from "@holeshot/types/src";
import RaceLogModal from "./race-log-modal.vue";

@Component({
  components: {
    EventDetailsModal,
    EventsUpcoming,
    EventsPrevious,
    EventSearch,
    RaceLogModal,
    SchedulerControls,
  },
})
export default class Schedule extends BaseControl {
  @State("Scheduler") state!: SchedulerState;

  showEventDetails = false;
  showRaceLog = false;

  activeControl = "EventsUpcoming";
  currentEvent!: Event | null;

  get upcomingEvents() {
    return schedulerModule.upcomingEvents;
  }

  get previousEvents() {
    return schedulerModule.previousEvents;
  }
  controlsClicked(control: string) {
    this.activeControl = control;
  }

  eventDetailsClosed() {
    this.currentEvent = null;
    this.showEventDetails = false;
  }

  raceLogClosed() {
    this.showRaceLog = false;
    this.showEventDetails = true;
  }

  eventClicked(event: Event) {
    this.currentEvent = event;
    this.showEventDetails = true;
    this.showRaceLog = false;
  }

  openRaceLog() {
    this.showEventDetails = false;
    this.showRaceLog = true;
  }

  created() {
    // lazy local testing... yes it's lame but quick and easy. :)
    if (process.env.NODE_ENV !== "production") {
      schedulerModule.mutate((s: SchedulerState) => (s.schedule = []));

      const schedule = [
        {
          date: "2023-03-27T00:00:00",
          trackName: "Hornet`s Nest BMX",
          track: {
            name: "Hornet`s Nest BMX",
            location: {
              mapLink:
                "http://maps.google.com/maps?q=35.320255,-80.872293&iwloc=A&iwd=1",
              address: {
                state: "Nc",
                line2: "",
                city: "Charlotte",
                line1: "6301 Beatties Ford Rd",
                postalCode: "28216",
              },
              gps: {
                lat: "35.320255",
                long: "-80.872293",
              },
            },
          },
          created: "2023-03-07T23:07:36.561Z",
          eventType: "Practice",
          details: {
            description:
              "Timing is available for the best training in the Carolina’s",
            registrationEnd: "2pm",
            registrationStart: "10am",
            type: "Practice",
            raceTime: "10am",
            fee: "$0.00 USD",
          },
          url: "www.usabmx.com/tracks/1316/events/511020",
          name: "Practice",
        },
        {
          date: "2023-03-26T00:00:00",
          trackName: "Hornet`s Nest BMX",
          track: {
            name: "Hornet`s Nest BMX",
            location: {
              mapLink:
                "http://maps.google.com/maps?q=35.320255,-80.872293&iwloc=A&iwd=1",
              address: {
                state: "Nc",
                line2: "",
                city: "Charlotte",
                line1: "6301 Beatties Ford Rd",
                postalCode: "28216",
              },
              gps: {
                lat: "35.320255",
                long: "-80.872293",
              },
            },
          },
          created: "2023-03-07T23:07:36.562Z",
          eventType: "Local Race",
          details: {
            description: "Bmx",
            registrationEnd: "3:00 PM",
            registrationStart: "2:00 PM",
            type: "Local Race",
            raceTime: "3:15 PM",
          },
          url: "www.usabmx.com/tracks/1316/events/510972",
          name: "Local Race Single",
        },
        {
          date: "2023-03-31T00:00:00",
          trackName: "Rock Hill BMX Supercross Track",
          track: {
            name: "Rock Hill BMX Supercross Track",
            location: {
              mapLink:
                "http://maps.google.com/maps?q=34.9744394,-80.9667001&iwloc=A&iwd=1",
              address: {
                state: "Sc",
                line2: "",
                city: "Rock Hill",
                line1: "1307 Riverwalk Parkway",
                postalCode: "29730",
              },
              gps: {
                lat: "34.9744394",
                long: "-80.9667001",
              },
            },
          },
          created: "2023-03-07T22:43:44.870Z",
          eventType: "Carolina Nationals",
          details: {
            fee: "$60.00 USD",
            status: "PRESIGN",
          },
          url: "www.usabmx.com/tracks/1971/events/508745",
          name: "Carolina Nationals",
        },
        {
          date: "2023-04-01T00:00:00",
          trackName: "Hornet`s Nest BMX",
          track: {
            name: "Hornet`s Nest BMX",
            location: {
              mapLink:
                "http://maps.google.com/maps?q=35.320255,-80.872293&iwloc=A&iwd=1",
              address: {
                state: "Nc",
                line2: "",
                city: "Charlotte",
                line1: "6301 Beatties Ford Rd",
                postalCode: "28216",
              },
              gps: {
                lat: "35.320255",
                long: "-80.872293",
              },
            },
          },
          created: "2023-03-07T23:07:38.042Z",
          eventType: "Practice",
          details: {
            description:
              "Timing is available for the best training in the Carolina’s",
            registrationEnd: "2pm",
            registrationStart: "10am",
            type: "Practice",
            raceTime: "10am",
            fee: "$0.00 USD",
          },
          url: "www.usabmx.com/tracks/1316/events/511021",
          name: "Practice",
        },
        {
          date: "2023-04-08T00:00:00",
          trackName: "Hornet`s Nest BMX",
          track: {
            name: "Hornet`s Nest BMX",
            location: {
              mapLink:
                "http://maps.google.com/maps?q=35.320255,-80.872293&iwloc=A&iwd=1",
              address: {
                state: "Nc",
                line2: "",
                city: "Charlotte",
                line1: "6301 Beatties Ford Rd",
                postalCode: "28216",
              },
              gps: {
                lat: "35.320255",
                long: "-80.872293",
              },
            },
          },
          created: "2023-03-07T23:07:38.044Z",
          eventType: "Practice",
          details: {
            description:
              "Timing is available for the best training in the Carolina’s",
            registrationEnd: "2pm",
            registrationStart: "10am",
            type: "Practice",
            raceTime: "10am",
            fee: "$0.00 USD",
          },
          url: "www.usabmx.com/tracks/1316/events/511022",
          name: "Practice",
        },
      ];

      const previous = schedule.filter(
        (e) => e.date < new Date(new Date().setHours(0, 0, 0, 0)).toJSON()
      );

      schedulerModule[Actions.Scheduler.setPrevious]({
        schedule: previous,
      });

      const upcoming = schedule.filter(
        (e) => e.date >= new Date(new Date().setHours(0, 0, 0, 0)).toJSON()
      );

      schedulerModule[Actions.Scheduler.setUpcoming]({
        schedule: upcoming,
      });
    }
  }
}
</script>

<!-- <style lang="scss" scoped>
.events {
}

@media (max-width: 768px) {
  .events {
  }
}
</style> -->
