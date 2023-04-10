<template>
  <div class="row">
    <input ref="fieldName" placeholder="Field Name" class="form-control" />
    <Button class="m-0 mt-2" @click="addAttribute">Add Field</Button>
    <div v-for="(attribute, key, index) in log.attributes" :key="index">
      <div>
        <h3>{{ key }}</h3>
        <textarea
          :id="key"
          class="attribute-field"
          v-model="log.attributes[key]"
        />
      </div>
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
    const field = this.$refs.fieldName["value"].replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );

    this.log.attributes[field] = "";
    this.$refs.fieldName["value"] = "";

    this.$forceUpdate();

    setTimeout(() => {
      const i = window.document.getElementById(field);
      console.log(field, i);
      i?.focus();
    }, 1);
  }
}
</script>
<style>
.attribute-field {
  width: 100%;
  height: 10em;
}
</style>
