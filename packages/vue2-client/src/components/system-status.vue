<template>
  <div><div class="socket-status" v-html="socketStatus"></div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { WebSocketsState } from '../store';
import { State } from 'vuex-class';

@Component
export default class SystemStatus extends Vue {
  @State('WebSockets') state!: WebSocketsState;

  get socketStatus() {
    if (this.state.status == 'Disconnected' || this.state.status == 'None') {
      return this.state.status;
    }
    return '';
  }
}
</script>

<style scoped>
div {
  height: 1.5em;
  background-color: black;
}

.socket-status {
  font-size: small;
}
</style>
