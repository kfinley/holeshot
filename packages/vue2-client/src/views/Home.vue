<template>
  <span class="feed-wrapper">
    <hero />
    <feed class="py-0 p-4" />
  </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Feed from './Feed.md';
import { Hero } from '../components/';

@Component({
  components: {
    Hero,
    Feed,
  },
})
export default class Home extends Vue {}
</script>
