<template>
  <div v-if="loaded">
    <div v-for="(attribute, key, index) in log.attributes" :key="index">
      <h3>{{ key }}</h3>
      <p v-html="display(attribute)"></p>
    </div>
  </div>
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

  display(attribute: string): string {
    console.log(attribute);
    return attribute.replaceAll("\n\n", "</br></br>").replaceAll("\n", "</br>");
  }
}
</script>
