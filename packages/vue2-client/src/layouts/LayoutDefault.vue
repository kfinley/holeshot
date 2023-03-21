<template>
  <div class="LayoutDefault">
    <Header class="LayoutDefault__header" />
    <Notification />
    <main class="LayoutDefault__main">
      <router-view />
    </main>
    <Footer class="LayoutDefault__footer" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Header, Footer } from '../components/'
import Notification from '@finley/vue2-components/src/components/notification.vue'

@Component({
  components: {
    Header,
    Footer,
    Notification,
  },
})
export default class LayoutDefault extends Vue {}
</script>

<style lang="scss">
.LayoutDefault {
  margin-right: auto;
  margin-left: auto;

  &__header {
    border-bottom: 1px solid grey;
    background: $header-background;
  }

  &__main {
    padding-top: 2em;
    padding-bottom: 4em;
  }

  &__main > div {
    padding: 0em 2em 2em 2em;
  }

  &__main > span > div > div > p > img {
    max-width: 99%;
    border-radius: 6px;
  }

  &__footer {
    background: $footer-background;
    color: $footer-color;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding-top: 0.25em;
    padding-bottom: 0.25em;
    border-top: 1px solid grey;
    text-align: center;
  }
}

.article-wrapper > div > div > p > img {
  max-width: 99%;
  border-radius: 6px;
}

@media (min-width: 768px) {
  .LayoutDefault {
    // Handle Home & Posts pages
    &__main > span > div:nth-child(2) {
      max-width: 900px;
      margin: auto;
    }
    // Handle Article pages
    &__main > article {
      max-width: 900px;
      margin: auto;
    }
  }
}
</style>
