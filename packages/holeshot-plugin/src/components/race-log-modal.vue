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
      <Button v-if="state.viewState == 'View'" @click="close">Close</Button>
      <Button v-if="state.viewState == 'Edit'" @click="cancel">Cancel</Button>
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
  cancel = raceLogsModule.cancel;

  // @Watch("state")
  // onViewStateChanged(value) {
  //   console.log('onViewStateChanged', value);
  //   if (value == "Closed") {
  //     this.close();
  //   }
  // }

  mounted() {
    raceLogsModule.init({ event: this.event });
  }

  get disabled() {
    return super.connecting;
  }

  close() {
    console.log("race-log-modal.close");
    const scrollY = window.document.body.style.top;

    window.document.getElementsByTagName("main")[0].removeAttribute("style");
    document.body.style.position = "";
    document.body.style.top = ``;
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
    raceLogsModule.close();

    this.$emit("close");
  }
}
</script>

<style lang="scss" scoped>
.label {
  font-weight: bold;
}
</style>
