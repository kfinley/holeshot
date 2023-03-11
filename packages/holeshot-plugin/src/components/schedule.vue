<template>
  <div v-if="hasEvents"></div>
</template>

<script>
import { Component } from "vue-property-decorator";
import BaseControl from "./base-control";

@Component({})
export default class Schedule extends BaseControl {

  get hasEvents() {
    return false;
  }
}
</script>

<style></style>
