<template>
  <div class="events">
    {{ articlesState.searchResult }}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { EventsState } from '../store/state';

@Component({})
export default class Events extends Vue {
  @State('Articles') articlesState!: EventsState;
}
</script>

<style lang="scss" scoped>
.events {
}

@media (max-width: 768px) {
  .events {
  }
}
</style>
