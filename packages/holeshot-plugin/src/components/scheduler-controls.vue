<template>
  <div class="controls row">
    <div
      ref="eventsPrevious"
      class="col p-3 clickable"
      @click="click('EventsPrevious')"
    >
      <div class="material-icons">directions_bike</div>
      <div>Previous</div>
    </div>
    <div
      ref="eventsUpcoming"
      class="col p-3 clickable active"
      @click="click('EventsUpcoming')"
    >
      <div class="material-icons">calendar_today</div>
      <div>Upcoming</div>
    </div>
    <div
      ref="eventsSearch"
      class="col p-3 clickable"
      @click="click('EventsSearch')"
    >
      <div class="material-icons">search</div>
      <div>Search</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BaseControl from "./base-control";
import { SchedulerState } from "../store";
import { State } from "vuex-class";

@Component({})
export default class ScheduleControls extends BaseControl {
  @State("Scheduler") state!: SchedulerState;
  click(control: string) {
    this.$refs.eventsPrevious.classList.remove("active");
    this.$refs.eventsUpcoming.classList.remove("active");
    this.$refs.eventsSearch.classList.remove("active");

    switch (control) {
      case "EventsPrevious":
        this.$refs.eventsPrevious.classList.add("active");
        break;
      case "EventsUpcoming":
        this.$refs.eventsUpcoming.classList.add("active");
        break;
      case "EventsSearch":
        this.$refs.eventsSearch.classList.add("active");
        break;
      default:
        break;
    }
    this.$emit("click", control);
  }
}
</script>

<style lang="scss" scoped>
.controls {
  position: fixed;
  bottom: 1em;
  padding: 0;
  width: 103%;
  height: 70px;
  text-align: center;
  color: $color--grey80;
  background: $dark;
  left: 0%;
  z-index: 100;
}

.active {
  color: $color--bright-red;
}

.controls > div:nth-child(1) {
  padding-left: 20px !important;
}
</style>
