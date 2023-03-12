<template>
  <card showClose="false">
    <div v-if="hasEvent" class="event-card">
      <div>
        <card
          class="date"
          :showClose="false"
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
          {{ printIfDetailIncludes(key, detail, ["start", "end"]) }}
        </div>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Card from "@finley/vue2-components/src/components/card.vue";
import { Track, Event } from "@holeshot/types/src";
import BaseControl from "./base-control";

@Component({
  components: { Card },
})
export default class EventCard extends BaseControl {
  @Prop()
  track!: Track;

  @Prop()
  event!: Event;

  printIfDetailIncludes(key: string, detail: string, includes: Array<string>) {
    console.log(detail);
    console.log(key);

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
}
</script>

<style lang="scss">
.card-body {
  padding: 10px;
}
.card-header {
  background: $color--dark-red;
  color: $color--grey80;
  font-weight: bold;
  padding: 5px;
}

@media screen and (max-width: $bp--sm-min) {
  .col {
    padding: 2px;
  }
}
</style>

<style lang="scss" scoped>
.container {
  padding: 0;
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
