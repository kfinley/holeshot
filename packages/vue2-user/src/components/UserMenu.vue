<template>
  <a href="#" v-if="display" @click.prevent="showUserMenuClick">
    <i
      v-if="connecting"
      class="bi bi-person-fill"
      style="color: yellow"
      title="Connecting to WebSocket Server..."
    ></i>
    <i v-else class="bi bi-person-fill"></i>
  </a>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { AuthStatus, UserState } from '../store';
import { State } from 'vuex-class';

@Component
export default class UserMenu extends Vue {
  @State('User') state!: UserState;
  @State('WebSockets') ws_state!: any;

  get display() {
    return this.state.authStatus == AuthStatus.LoggedIn;
  }

  get connecting() {
    return this.ws_state.status === 'Connecting';
  }

  showUserMenuClick() {
    if (!this.connecting) {
      console.log('showUserMenuClick');
    }
  }
}
</script>

<style lang="scss" scoped>
i {
  color: rgba(255, 255, 255, 0.6);
}
</style>
