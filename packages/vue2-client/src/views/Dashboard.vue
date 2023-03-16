<template>
 <div class="p-4">
    <scheduler />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { EventSearch, Scheduler } from '../components/';

@Component({
  components: {
    Scheduler,
    EventSearch,
  },
})
export default class Dashboard extends Vue {}
</script>
