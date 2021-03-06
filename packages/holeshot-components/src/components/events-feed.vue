<template>
  <div>
    <!-- TODO: float this... -->
    <notification
      ref="notification"
      type="success"
      timed="true"
      v-if="showNotification"
      @notification-closed="notificationClosed"
      :message="notificationMessage"
      :delay="3"
      />
    <swipeable-list
      @draggedComplete="dragged"
      @outOfSight="out"
      :items="events"
      max-width="100%"
      x-threshold="150"
      @doubleClicked="doubleClicked"
    >
      <template v-slot:card="{ entity }">
        <div class="event-card">
          <div>
            <card
              class="date"
              :showClose="false"
              :headerText="monthName(entity.date)"
            >
              <div class="day">{{ entity.date.getDay() }}</div>
              <div>{{ weekdayName(entity.date) }}</div>
            </card>
          </div>
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
        </div>
      </template>
    </swipeable-list>

    <event-details-modal
      v-if="showEventDetails"
      :event="currentEvent"
      @close="eventDetailsClosed"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { SwipeableEvent, Event } from "@holeshot/types/src";
import Entity from "vue2-components/src/components/entity.vue";
import SwipeableList from "vue2-components/src/components/swipeable-list.vue";
import Card from "vue2-components/src/components/card.vue";
import SwipeableEntity from "vue2-components/src/components/swipeable.vue";
import Modal from "vue2-components/src/components/modal.vue";
import EventDetailsModal from "./event-details-modal.vue";
import Notification from "vue2-components/src/components/notification.vue";

@Component({
  components: {
    Card,
    Entity,
    EventDetailsModal,
    SwipeableList,
    Modal,
    Notification,
  },
})
export default class EventList extends Vue {
  @Prop()
  events!: Array<SwipeableEvent>;

  currentEvent!: Event;
  showEventDetails = false;
  showNotification = false;
  notificationMessage = "";

  //TODO: localize....
  monthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format;
  weekdayName = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format;

  printIfDetailIncludes(detail: Array<string>, includes: Array<string>) {
    let val = "";

    includes.forEach((i) => {
      if (detail[0].toLowerCase().includes(i)) {
        val = `${detail[0]}: ${detail[1]}`;
      }
    });

    return val;
  }

  doubleClicked(event: Event) {
    console.log(`doubleClicked event ${event.name}`);
    this.currentEvent = event;
    this.showEventDetails = true;
  }

  eventDetailsClosed() {
    this.currentEvent = null;
    this.showEventDetails = false;
  }

  notificationClosed() {
    this.notificationMessage = '';
    this.showNotification = false;
  }

  @Emit("draggedComplete")
  dragged(args: {
    handleDragged: any;
    dragged: { direction: string; id: any };
  }) {
    const { direction, id } = args.dragged;

    console.log(args.dragged);

    if (direction == "right") {
      this.$emit("save", id);
      this.showNotification = true;
      this.notificationMessage = "Event has been added to your schedule";
      console.log("save");
    } else if (direction == "left") {
      this.$emit("skip", id);
      console.log("skip");
    }

    return args;
  }

  getDate(item: any) {
    console.log(item.date);
    return new Date(item.date);
  }

  @Emit("outOfSight")
  out(args: {
    outOfSightHandle: (
      items: Array<SwipeableEntity>,
      item: SwipeableEntity
    ) => Array<SwipeableEntity>;
    item: SwipeableEntity;
  }) {
    return args;
  }

}
</script>


<style lang="scss">
// TODO: deal with this...
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
  width: 20%;
  float: left;
  padding: 10px;
  display: table-cell;
  vertical-align: middle;
}

.event-card > div:nth-child(2) {
  width: 80%;
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

@media screen and (max-width: $bp--sm-min) {
  .event-card > div:nth-child(1) {
    padding: 5px;
    width: 30%;
  }

  .event-card > div:nth-child(2) {
    width: 70%;
  }
  .date {
    padding-right: 12px;
  }
}
</style>
