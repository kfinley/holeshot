<template>
  <div v-if="loaded">{{ log.event.name }}</div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import BaseControl from "./base-control";
import { RaceLog } from "@holeshot/types/src";

@Component({})
export default class RaceLogView extends BaseControl {
  @Prop({ default: null })
  log: RaceLog;

  get loaded() {
    return this.log != null;
  }
}
</script>
