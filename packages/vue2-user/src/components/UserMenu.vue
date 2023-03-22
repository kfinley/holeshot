<template>
  <div>
    <a href="#" v-if="loggedIn" @click="showUserMenuClick">
      <i
        v-if="connecting"
        class="bi bi-person-fill"
        style="color: yellow"
        title="Connecting to WebSocket Server..."
      ></i>
      <i v-else class="bi bi-person-fill"></i>
    </a>
    <router-link v-else :to="{ name: routes.Login }"> Login </router-link>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { AuthStatus, UserState } from '../store';
import { State } from 'vuex-class';
import { RouteNames } from '../router';

@Component
export default class UserMenu extends Vue {
  routes = RouteNames;

  @State('User') state!: UserState;
  @State('WebSockets') ws_state!: any;

  get loggedIn() {
    return this.state.authStatus == AuthStatus.LoggedIn;
  }

  get connecting() {
    return this.ws_state.status === 'Connecting';
  }

  showUserMenuClick() {
    this.$router.push({ name: this.routes.UserSettings });
  }
}
</script>

<style lang="scss" scoped>
i {
  color: rgba(255, 255, 255, 0.6);
}
</style>
