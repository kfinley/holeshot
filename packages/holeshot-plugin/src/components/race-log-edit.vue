<template>
  <div class="row">
    <input ref="fieldName" placeholder="Field Name" class="form-control" />
    <Button class="m-0 mt-2" @click="addAttribute">Add Field</Button>
    <div v-for="(attribute, key, index) in log.attributes" :key="index">
      <div>{{ key }}</div>
      <textarea class="attribute-field" v-model="log.attributes[key]" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import BaseControl from "./base-control";
import { RaceLog } from "@holeshot/types/src";

@Component({})
export default class RaceLogEdit extends BaseControl {
  @Prop({ default: null })
  log: RaceLog;

  get loaded() {
    return this.log != null;
  }

  addAttribute() {
    console.log(this.$refs.fieldName["value"]);
    this.log.attributes[this.$refs.fieldName["value"]] = "";
    this.$refs.fieldName["value"] = "";
    this.$forceUpdate();
  }
}
</script>
<style>
.attribute-field {
  width: 100%;
  height: 10em;
}
</style>
