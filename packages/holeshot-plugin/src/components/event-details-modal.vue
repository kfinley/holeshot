<template>
  <modal @close="$emit('close')" width="90%">
    <div slot="header">
      <h3>{{ event.name }}<br />@ {{ event.track.name }}</h3>
    </div>
    <div slot="body">
      <div class="body">
        <div>
          <span class="label">Date: </span
          >{{ new Date(event.date).toLocaleDateString("en-US") }}
        </div>
        <div v-for="(detail, key, index) in event.details" :key="index">
          <span class="label">{{ toSentence(key) }}: </span>
          <span v-html="detail" />
        </div>
      </div>
    </div>
    <div slot="footer" v-if="!disabled">
      <Button v-if="showRaceLog" @click="openRaceLog">Race Log</Button>
      <Button v-if="showRemove" @click="removeFromSchedule"> Remove </Button>
      <Button @click="$emit('close')"> Close </Button>
    </div>
  </modal>
</template>

<script lang="ts">
import BaseControl from "./base-control";
import { Component, Prop } from "vue-property-decorator";
import { Event } from "@holeshot/types/src";
import Modal from "@finley/vue2-components/src/components/modal.vue";
import { schedulerModule } from "../store";

@Component({
  components: {
    Modal,
  },
})
export default class EventDetailsModal extends BaseControl {
  @Prop()
  event!: Event;

  // Any events with these words in the name will get an add RaceLog button.
  logEventTypes = ["Race", "Nationals", "Cup"];

  //TODO: currently hardcoded to adjust to pacific time
  today = new Date(new Date().setHours(-7, 0, 0, 0))
    .toJSON()
    .replace(".000Z", "");

  async removeFromSchedule() {
    await schedulerModule.removeFromSchedule({ event: this.event });
    this.$emit("close");
  }

  get disabled() {
    return super.disconnected;
  }

  get showRaceLog() {
    return (
      this.event.date <= this.today &&
      this.event.eventType
        .split(" ")
        .some((s) => this.logEventTypes.indexOf(s) >= 0)
    );
  }

  get showRemove() {
    return this.event.date >= this.today;
  }

  openRaceLog() {
    this.$emit("open-race-log");
  }

}
</script>

<style lang="scss" scoped>
.label {
  font-weight: bold;
}
</style>
