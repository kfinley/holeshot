<template>
  <card showClose="false">
    <div v-if="hasEvent" class="event-card">
      <div>
        <card
          class="date"
          :showClose="false"
          padding="0"
          :headerText="monthName(new Date(event.date))"
        >
          <div class="day">{{ getDay(new Date(event.date)) }}</div>
          <div>{{ weekdayName(new Date(event.date)) }}</div>
        </card>
      </div>
      <div class="event">
        <div>{{ event.name }}</div>
        <div>{{ track.name }}</div>
        <div>
          {{ track.location.address.city }}, {{ track.location.address.state }}
        </div>
        <div v-for="(detail, key, index) in event.details" :key="index">
          {{ printIfIncludes(key, ["start", "end"], detail) }}
        </div>
        <Button
          v-if="showAddToSchedule"
          label="Add to Schedule"
          :classes="['btn--grey-hover-fill']"
          :disabled="disconnected"
          @clicked="addToSchedule"
          >Add to Schedule</Button
        >
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Card from "@finley/vue2-components/src/components/card.vue";
import { Track, Event } from "@holeshot/types/src";
import BaseControl from "./base-control";
import { SchedulerState } from "../store";
import { SchedulerModule } from "../store/scheduler-module";
import { State } from "vuex-class";
import { getModule } from "vuex-module-decorators";

@Component({
  components: { Card },
})
export default class EventCard extends BaseControl {
  @State("Scheduler") state!: SchedulerState;

  @Prop()
  track!: Track;

  @Prop()
  event!: Event;

  @Prop({ required: false, default: false })
  showAddToSchedule!: boolean;

  mounted() {
    if (!this.showAddToSchedule) {
      this.$el.addEventListener("click", this.click, false);
    }
  }

  printIfIncludes(key: string, includes: Array<string>, detail: string) {
    let val = "";

    includes.forEach((i) => {
      if (key.toLowerCase().includes(i)) {
        val = `${this.toSentence(key)}: ${detail}`;
      }
    });

    return val;
  }

  get hasEvent() {
    return this.event !== undefined && this.track !== undefined;
  }

  addToSchedule() {
    getModule(SchedulerModule, this.$store).addToSchedule({
      track: this.track,
      event: this.event,
    });
  }

  click() {
    this.$emit("click");
  }
}
</script>

<style lang="scss" scoped>
.date::v-deep .card-body {
  padding: 10px;
}

.date::v-deep .card-header {
  color: $color--grey80;
  font-weight: bold;
  padding: 5px;
}

.date::v-deep .col {
  padding-left: 0;
}

.event-card > div:nth-child(1) {
  width: 30%;
  float: left;
  padding: 10px;
  display: table-cell;
  vertical-align: middle;
}

.event-card > div:nth-child(2) {
  width: 70%;
  float: right;
  display: block;
}

.date {
  margin: auto;
  max-width: 138px;
  text-align: center;
}

.day {
  font-weight: bold;
  font-size: 180%;
}

.event {
  padding-top: 2%;
  width: 100%;
}

.event > div:nth-child(1) {
  font-weight: bold;
}

.event > div:nth-child(2),
.event > div:nth-child(3) {
  font-style: italic;
}
</style>
