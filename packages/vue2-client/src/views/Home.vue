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
export default class Home extends Vue {
  mounted() {
    setTimeout(() => {
      try {
        Array.from(document.querySelectorAll('div > p')).map((p) => {
          //   // Remove indent for any paragraphs that are 2 lines or less.
          if (p.clientHeight <= 50) {
            (p as any).style['text-indent'] = '0';
          }
        });
      } catch (e) {
        console.log(e);
      }
    }, 200);
  }
}
</script>
