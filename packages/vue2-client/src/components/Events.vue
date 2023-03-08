<template>
  <div class="events">
    <ul>
      <li v-for="(event, index) in eventsState.searchResult" :key="index">
          {{ event.name }}
      </li>
    </ul>

    {{ articlesState.searchResult }}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { EventsState } from '../store/state';

@Component({})
export default class Events extends Vue {
  @State('Articles') eventsState!: EventsState;
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
