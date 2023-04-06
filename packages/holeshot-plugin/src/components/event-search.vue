<template>
  <div class="row event-search">
    <h3 align="center">Search For Events</h3>
    <div v-if="state.showCriteriaPanel">
      <div class="row">
        <label class="col-6" for="type">What type of event? </label>
        <select
          name="type"
          id="type"
          v-model="state.searchInput.type"
          class="col-6"
        >
          <option value="Practice">Practice</option>
          <option value="Race">Race</option>
          <option value="Gold Cup">Gold Cup</option>
          <option value="National">National</option>
          <option value="Clinic">Clinic</option>
        </select>
      </div>
      <div class="row">
        <label class="col-4" for="distance">Distance?</label>
        <select
          name="distance"
          id="distance"
          v-model="state.searchInput.distance"
          class="col-8"
        >
          <option value="50">50 miles</option>
          <option value="100">100 miles</option>
          <option value="250">250 miles</option>
          <option value="500">500 miles</option>
        </select>
      </div>
      <!-- <input
        id="location"
        name="location"
        v-model="state.searchInput.location"
        placeholder="(Optional) if left blank home track is used"
        class="form-control"
      /> -->
      <!-- <input
        id="name"
        v-model="state.searchInput.name"
        placeholder="(Optional) refine search by event name"
        class="form-control"
      /> -->
      <!-- <div class="container p-0"> -->
      <div class="row">
        <label class="col-4" for="startDate">Start Date:</label>
        <date-picker
          id="startDate"
          class="col-8 datepicker"
          :editable="false"
          :clearable="false"
          v-model="state.searchInput.startDate"
        ></date-picker>
      </div>
      <!-- </div> -->
      <div class="row">
        <label class="col-4" for="endDate">End Date:</label>
        <date-picker
          id="endDate"
          class="col-8 datepicker"
          :editable="false"
          :clearable="false"
          v-model="state.searchInput.endDate"
        ></date-picker>
      </div>
    </div>
    <div v-else class="event text-center" @click.prevent="openCriteriaPanel">
      Type: {{ state.searchInput.type }} {{ state.searchInput.name }} (click to
      change search)
    </div>
    <div class="align-self-center action-controls my-3" align="center">
      <div v-if="state.status == 'Loaded'">
        <div class="text-center">
          <button
            type="submit"
            class="btn primary-gradient w-100"
            :disabled="disabled"
            @click.prevent="search"
          >
            <span
              v-if="searching"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            Search
          </button>
        </div>
      </div>
      <span
        v-else-if="state.status == 'Searching'"
        class="spinner-border spinner-border-md"
        role="status"
        aria-hidden="true"
      ></span>
    </div>
    <div class="search-results text-center" v-if="state.searchResults !== null">
      <div>
        Found {{ state.searchResults.events.length }} at
        {{ state.searchResults.searched }} track{{
          state.searchResults.searched > 1 ? "s" : ""
        }}.
      </div>
      <div v-for="(event, index) in state.searchResults.events" :key="index">
        <event-card
          :track="trackFor(event)"
          :event="event"
          show-add-to-schedule="true"
          @added-to-schedule="addedToSchedule"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BaseControl from "./base-control";
import TypeAhead from "@finley/vue2-components/src/components/type-ahead.vue";
import { Event, Track } from "@holeshot/types/src";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import { searchModule, SearchState, SearchStatus } from "../store";
import { State } from "vuex-class";
import EventCard from "./event-card.vue";
import { notificationModule } from "@finley/vue2-components/src/store";

@Component({
  components: {
    TypeAhead,
    DatePicker,
    EventCard,
  },
})
export default class EventSearch extends BaseControl {
  @State("Search") state!: SearchState;

  // setup any calls into our vuex store module
  search = searchModule.search;
  openCriteriaPanel = searchModule.openCriteriaPanel;

  created() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1);

    // Set the initial state when created to prevent issue rendering default UI
    this.state.searchInput = {
      startDate,
      endDate,
      type: "Race",
      distance: 100,
    };
  }

  mounted() {
    // Null out any previous search results
    this.state.searchResults = null;

    searchModule.setLocation();
    if (this.state.status != "Searching") {
      this.state.showCriteriaPanel = true;
    }

    // Example of lazy local testing... yes it's lame but quick and easy. :)
    if (process.env.NODE_ENV !== "production") {
      this.state.searchResults = {
        searched: 1,
        tracks: [
          {
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
            },
          },
        ],
        events: [
          {
            id: "e3e291cc-76ef-4b77-9238-7797936468af",
            name: "Practice",
            trackName: "Rock Hill BMX Supercross Track",
            date: "2023-03-30T00:00:00",
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
          {
            id: "e3e291cc-76ef-4b77-9238-7797936468af",
            name: "Practice",
            trackName: "Rock Hill BMX Supercross Track",
            date: "2023-04-04T00:00:00",
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
          {
            id: "e3e291cc-76ef-4b77-9238-7797936468af",
            name: "Local Race",
            trackName: "Rock Hill BMX Supercross Track",
            date: "2023-04-06T00:00:00",
            url: "www.usabmx.com/tracks/1971/events/493331",
            eventType: "Race",
            details: {
              registrationStart: "4:00 PM",
              registrationEnd: "8:00 PM",
              raceTime: "4:00 PM",
              type: "Race",
              description: "$5 USA BMX Race 4-8PM",
              fee: "$5.00 USD",
            },
          },
        ],
      };
    }
  }

  get searching() {
    return this.state.status == SearchStatus.Searching;
  }

  get disabled() {
    return super.disconnected || this.searching;
  }

  trackFor(event: Event) {
    const track = this.state.searchResults.tracks.find(
      (t: Track) => t.name == event.trackName
    );
    return track;
  }

  addedToSchedule(event: Event) {
    searchModule.mutate((s: SearchState) => {
      s.searchResults.events = s.searchResults.events.filter(
        (e) =>
          !(
            e.name === event.name &&
            e.date === event.date &&
            e.trackName === event.trackName
          )
      );
    });
    notificationModule.add({
      message: `${event.name} was added to your schedule`,
      type: "success",
      timed: true,
    });
  }
}
</script>

<style scoped>
.event-search > div > * {
  display: block;
}

.event-search {
  padding-top: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  min-width: 300px;
  max-width: 375px;
}

.event {
  border-bottom: 1px;
  border-bottom-style: solid;
  min-width: 90%;
}

.datepicker {
  width: 66.6%;
  padding: 0px;
}

.row {
  padding: 5px 0px;
}
</style>
