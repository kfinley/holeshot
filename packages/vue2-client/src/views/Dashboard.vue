<template>
 <div class="p-4">
    <h1>Dashboard</h1>
    <event-search />
    <Functions />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Events, Functions, EventSearch } from '../components/';

@Component({
  components: {
    Events,
    Functions,
    EventSearch,
  },
})
export default class Home extends Vue {}
</script>
