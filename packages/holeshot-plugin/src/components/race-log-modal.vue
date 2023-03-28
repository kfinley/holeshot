<template>
  <modal @close="$emit('close')" width="95%" height="95%">
    <div slot="header">
      <h2>Race Log</h2>
      <h3>{{ event.name }} @ {{ event.track.name }}</h3>
    </div>
    <div slot="body">
      <div class="body">Race Log!</div>
    </div>
    <div slot="footer" v-if="!disabled">
      <Button @click="$emit('close')"> Close </Button>
    </div>
  </modal>
</template>

<script lang="ts">
import BaseControl from "./base-control";
import { Component, Prop } from "vue-property-decorator";
import { Event } from "@holeshot/types/src";
import Modal from "@finley/vue2-components/src/components/modal.vue";

@Component({
  components: {
    Modal,
  },
})
export default class EventDetailsModal extends BaseControl {
  @Prop()
  event!: Event;

  //TODO: currently hardcoded to adjust to pacific time
  today = new Date(new Date().setHours(-7, 0, 0, 0))
    .toJSON()
    .replace(".000Z", "");

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
