<template>
  <div v-if="hasEvents"></div>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class Schedule extends Vue {

  get hasEvents() {
    return false;
  }
}
</script>

<style></style>
