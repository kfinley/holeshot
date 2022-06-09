<template>
  <modal @close="$emit('close')" width="85%">
    <div slot="header">
      <h3>{{ event.name }} <br />@ {{ event.track.name }}</h3>
    </div>
    <div slot="body">
      <div class="body">
        <div>
          <span class="label">Date: </span
          >{{ event.date.toLocaleDateString("en-US") }}
        </div>
        <div v-for="(detail, index) in event.details" :key="index">
          <span class="label">{{ detail[0] }}:</span>
          <span v-html="detail[1]" />
        </div>
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
.label {
  font-weight: bold;
}

</style>
