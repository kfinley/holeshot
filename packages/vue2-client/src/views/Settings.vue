<template>
  <div class="p-4">
    <user-settings exclude="['username']">
      <user-edit :user="state.currentUser"></user-edit>
    </user-settings>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { UserSettings, UserEdit } from '../components/';
import { UserState } from '@holeshot/vue2-user/src/store';
import { State } from 'vuex-class';

@Component({
  components: {
    UserSettings,
    UserEdit
  },
})
export default class Settings extends Vue {
  @State('User') state!: UserState;
}
</script>
