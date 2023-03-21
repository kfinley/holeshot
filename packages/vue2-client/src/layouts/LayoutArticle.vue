<template>
  <article class="article-wrapper" itemscope itemtype="https://schema.org/Article">
    <router-view />
  </article>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// import { metaFiles } from '../articles'

@Component({})
export default class ArticleLayout extends Vue {}
</script>

<style lang="scss">

.article-wrapper {
  padding: 2em;
  padding-top: 4em;
}

// Don't indent the author section at top of post
article > div > p:first-of-type {
  text-indent: 0px;
}
</style>
