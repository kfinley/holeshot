<template>
  <modal @close="$emit('close')">
    <div slot="header"><h3>{{ event.name }}</h3></div>
    <div slot="body">
      <div>
        Track: {{ event.track.name }}
      </div>
      <div v-for="(detail, index) in event.details" :key="index">
        <span>{{ detail[0] }}: {{ detail[1] }}</span>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Event } from "@holeshot/types/src";
import Modal from "vue2-components/src/components/modal.vue";
@Component({
  components: {
    Modal,
  },
})
export default class EventDetailsModal extends Vue {
  @Prop()
  event!: Event;
}
</script>

<style lang="scss" scoped>
</style>
