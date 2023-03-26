<template>
 <div class="p-4">
    <scheduler />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Scheduler } from '../components/';

@Component({
  components: {
    Scheduler,
  },
})
export default class Schedule extends Vue {}
</script>
