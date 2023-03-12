<template>
  <div>
    <div v-if="hasEvents"></div>
    <div else>
      <Button @click.prevent="findEvents"> Find Events </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BaseControl from "./base-control";
import * as RouteNames from "../route-names";

@Component({})
export default class Schedule extends BaseControl {
  get hasEvents() {
    return false;
  }

  findEvents() {
    this.$router.push({ name: RouteNames.FindEvents });
  }
}
</script>

<style></style>
