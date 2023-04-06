<template>
  <modal @close="close" width="95%" height="95%">
    <div slot="header">
      <h2>Race Log</h2>
      <h3>{{ event.name }} @ {{ event.track.name }}</h3>
    </div>
    <div slot="body">
      <div class="body">
        <race-log-view v-if="state.viewState == 'View'" :log="state.active" />
        <race-log-edit v-else :log="state.active" />
      </div>
    </div>
    <div slot="footer" v-if="!disabled">
      <Button v-if="state.viewState == 'View'" @click="edit"> Edit </Button>
      <Button @click="close">
        <span v-if="state.viewState == 'View'">Close</span>
        <span v-if="state.viewState == 'Edit'">Cancel</span>
      </Button>
      <Button v-if="state.viewState == 'Edit'" @click="save">Save</Button>
    </div>
  </modal>
</template>

<script lang="ts">
import BaseControl from "./base-control";
import { Component, Prop } from "vue-property-decorator";
import { Event } from "@holeshot/types/src";
import Modal from "@finley/vue2-components/src/components/modal.vue";
import { State } from "vuex-class";
import { raceLogsModule, RaceLogsState } from "../store";
import RaceLogEdit from "./race-log-edit.vue";
import RaceLogView from "./race-log-view.vue";

@Component({
  components: {
    Modal,
    RaceLogEdit,
    RaceLogView,
  },
})
export default class RaceLogModal extends BaseControl {
  @State("RaceLogs") state!: RaceLogsState;

  @Prop()
  event!: Event;

  // setup any calls into our vuex store module
  edit = raceLogsModule.edit;
  save = raceLogsModule.save;

  mounted() {
    raceLogsModule.init({ event: this.event });
  }

  get disabled() {
    return super.disconnected;
  }

  close() {
    window.document.getElementsByTagName("main")[0].removeAttribute("style");
    this.state.active = null;
    this.$emit("close");
  }
}
</script>

<style lang="scss" scoped>
.label {
  font-weight: bold;
}

</style>
