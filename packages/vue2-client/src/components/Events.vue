<template>
  <div class="events">
    <ul v-if="loaded">
      <li v-for="(event, index) in state.searchResult" :key="index">
        {{ event.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { getEventsModule } from '../store/events-module';
import { EventsState, Status } from '../store/state';

@Component({})
export default class Events extends Vue {
  @State('Events') state!: EventsState;

  created() {
    getEventsModule(this.$store);
  }

  loaded() {
    return this.state.status === Status.Loaded;
  }
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
