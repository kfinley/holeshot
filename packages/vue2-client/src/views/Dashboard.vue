<template>
 <div class="p-4">
    <h1>Dashboard</h1>
    <Functions />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Functions } from '../components/';

@Component({
  components: {
    Functions,
  },
})
export default class Home extends Vue {}
</script>
