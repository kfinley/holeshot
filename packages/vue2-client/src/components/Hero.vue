<template>
  <div class="hero"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Hero extends Vue {}
</script>

<style lang="scss" scoped>
.hero {
  background: url('img/holeshot-hero-blackhole.jpg') no-repeat;
  width: 100%;
  background-size: contain;
  background-position: 50%;
  padding-top: 12.8em !important;
}

@media (max-width: 768px) {
  .hero {
    padding-top: 10.8em !important;
  }
}
</style>
