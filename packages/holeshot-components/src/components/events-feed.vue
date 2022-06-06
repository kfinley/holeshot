<template>
  <swipeable-list
    @draggedComplete="dragged"
    @outOfSight="out"
    :items="events"
    maxWidth="60%"
  >
    <template v-slot:card="{ entity }">
      <card
        class="date"
        :showClose="false"
        :headerText="monthName(entity.date)"
      >
        <div class="day">{{ entity.date.getDay() }}</div>
        <div>{{ weekdayName(entity.date) }}</div>
      </card>
      <div class="event">
        <div>{{ entity.name }}</div>
        <div>{{ entity.track.name }}</div>
        <div>
          {{ entity.track.address.city }}, {{ entity.track.address.state }}
        </div>
        <div v-for="(detail, index) in entity.details" :key="index">
          {{ printIfDetailIncludes(detail, ["start", "end"]) }}
        </div>
      </div>
    </template>
  </swipeable-list>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { SwipeableEvent } from "@holeshot/types/src";
import Entity from "vue2-components/src/components/entity.vue";
import SwipeableList from "vue2-components/src/components/swipeable-list.vue";
import Card from "vue2-components/src/components/card.vue";
import SwipeableEntity from "vue2-components/src/components/swipeable.vue";

@Component({
  components: {
    Card,
    Entity,
    SwipeableList,
  },
})
export default class EventList extends Vue {
  @Prop()
  events!: Array<SwipeableEvent>;
  @Prop()
  save!: Function;
  @Prop()
  skip!: Function;

  monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format;
  weekdayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format;

  printIfDetailIncludes(detail: Array<string>, includes: Array<string>) {
    let val = "";

    includes.forEach((i) => {
      if (detail[0].toLowerCase().includes(i)) {
        val = `${detail[0]}: ${detail[1]}`;
      }
    });

    return val;
  }

  dragged(args: {
    handleDragged: any;
    dragged: { direction: string; id: any };
  }) {}

  getDate(item: any) {
    console.log(item.date);
    return new Date(item.date);
  }

  out(args: {
    outOfSightHandle: (
      items: Array<SwipeableEntity>,
      item: SwipeableEntity
    ) => Array<SwipeableEntity>;
    item: SwipeableEntity;
  }) {}

  draggedComplete(dragged: { direction: string; id?: string }) {
    const { direction, id } = dragged;

    switch (direction) {
      case "right": {
        this.$emit("save", id);
        this.save(id);
      }
      case "left": {
        this.$emit("skip", id);
        this.skip(id);
      }
    }
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
  font-size: 20%;
  font-weight: bolder;
}
</style>

<style lang="scss" scoped>
.date {
  position: relative;
  float: left;
  min-width: 150px;
  max-width: 150px;
  padding-right: 18px;
  text-align: center;
}

.day {
  font-weight: bold;
  font-size: 180%;
}

.event {
  padding-top: 2%;
}

.event > div:nth-child(1) {
  font-weight: bold;
}

.event > div:nth-child(2),
.event > div:nth-child(3) {
  font-style: italic;
}
</style>
