<template>
 <div class="p-4">
    <h1>Dashboard</h1>
    <Events />
    <Functions />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Events, Functions } from '../components/';

@Component({
  components: {
    Events,
    Functions,
  },
})
export default class Home extends Vue {}
</script>
