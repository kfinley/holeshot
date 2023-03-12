<template>
  <div class="row event-search">
    <div v-if="state.showCriteriaPanel">
      <div>
        <label for="type">What type of event? </label>
        <select
          name="type"
          id="type"
          v-model="state.searchInput.type"
          class="form-control"
        >
          <option value="Practice">Practice</option>
          <option value="Race">Race</option>
          <option value="Gold Cup">Gold Cup</option>
          <option value="National">National</option>
          <option value="Clinic">Clinic</option>
        </select>
      </div>
      <div>
        <label for="distance">Distance?</label>
        <select
          name="distance"
          id="distance"
          v-model="state.searchInput.distance"
          class="form-control"
        >
          <option value="50">50 miles</option>
          <option value="100">100 miles</option>
          <option value="250">250 miles</option>
          <option value="500">500 miles</option>
        </select>
      </div>
      <input
        id="location"
        name="location"
        placeholder="(Optional) if left black home track is used"
        class="form-control"
      />
      <input
        id="name"
        placeholder="(Optional) refine search by event name"
        class="form-control"
      />
      <div>
        <label for="startDate">Start Date:</label>
        <date-picker
          id="startDate"
          v-model="state.searchInput.startDate"
        ></date-picker>
      </div>
      <div>
        <label for="endDate">End Date:</label>
        <date-picker
          id="endDate"
          v-model="state.searchInput.endDate"
        ></date-picker>
      </div>
    </div>
    <div v-else class="event text-center" @click.prevent="openCriteriaPanel">
      Type: {{ state.searchInput.type }} {{ state.searchInput.name }}
    </div>
    <div class="align-self-center action-controls" align="center">
      <div v-if="state.status == 'Loaded'">
        <div class="text-center">
          <button
            type="submit"
            class="btn primary-gradient w-100 my-4 mb-2"
            :disabled="searching"
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
        v-else
        class="spinner-border spinner-border-md"
        role="status"
        aria-hidden="true"
      ></span>
    </div>
    <div class="search-results" v-if="state.searchResults !== null">
      <div>
        Found {{ state.searchResults.events.length }} at
        {{ state.searchResults.searched }} tracks.
      </div>
      <div v-for="(event, index) in state.searchResults.events" :key="index">
        <event-card :track="trackFor(event)" :event="event" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import BaseControl from "./base-control";
import TypeAhead from "@finley/vue2-components/src/components/type-ahead.vue";
import { Event, Track } from "@holeshot/types/src";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import { searchModule, SearchState, SearchStatus } from "../store";
import { State } from "vuex-class";
import EventCard from "./event-card.vue";

@Component({
  components: {
    TypeAhead,
    DatePicker,
    EventCard,
  },
})
export default class EventSearch extends BaseControl {
  @State("Search") state!: SearchState;

  @Prop({ default: false })
  disabled: boolean;

  _item!: Event; // Backing prop. Test if we still actually need this...

  created() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 1);

    // Set the initial state
    this.state.searchInput = {
      startDate,
      endDate,
      type: "Race",
      distance: 100,
    };
  }

  mounted() {
    this.state.searchResults = null;
  }

  search = searchModule.search;
  openCriteriaPanel = searchModule.openCriteriaPanel;

  get searching() {
    return this.state.status == SearchStatus.Searching;
  }

  trackFor(event: Event) {
    return this.state.searchResults.tracks.filter(
      (t: Track) => t.name == event.trackName
    );
  }
}
</script>

<style scoped>
.event-search > div > * {
  display: block;
}

.event-search {
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
</style>
