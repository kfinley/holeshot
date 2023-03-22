<template>
  <modal @close="$emit('close')" width="85%">
    <div slot="header">
      <h3>{{ event.name }} <br />@ {{ event.track.name }}</h3>
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
      <Button @click="removeFromSchedule"> Remove </Button>
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

  async removeFromSchedule() {
    await schedulerModule.removeFromSchedule({ event: this.event });
    this.$emit("close");
  }

  get disabled() {
    return super.disconnected;
  }

}
</script>

<style lang="scss" scoped>
.label {
  font-weight: bold;
}

</style>
