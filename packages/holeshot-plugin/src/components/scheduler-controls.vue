<template>
  <div class="controls row">
    <div class="col p-2 clickable" @click="click($event, 'EventsPrevious')">
      <div class="material-icons">directions_bike</div>
      <div>Previous</div>
    </div>
    <div
      class="col p-2 clickable active"
      @click="click($event, 'EventsUpcoming')"
    >
      <div class="material-icons">calendar_today</div>
      <div>Upcoming</div>
    </div>
    <div class="col p-2 clickable" @click="click($event, 'EventsSearch')">
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
  click($event: Event, control: string) {
    const parent = ($event.target as any).parentElement;

    const currentActive = parent.classList.contains("clickable")
      ? parent.parentElement.getElementsByClassName("active")[0]
      : parent;

    currentActive.classList.remove("active");

    const clickable = ($event.target as any).parentElement as Element;
    clickable.classList.add("active");
    this.$emit("click", control);
  }
}
</script>

<style lang="scss" scoped>
.controls {
  position: fixed;
  bottom: 1.7em;
  padding: 0;
  width: 103%;
  height: 70px;
  text-align: center;
  color: $color--grey80;
  background: $dark;
  left: 0%;
}

.active {
  color: $color--bright-red;
}

.controls > div:nth-child(1) {
  padding-left: 20px !important;
}
</style>
