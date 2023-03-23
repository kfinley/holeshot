<template>
 <div class="p-4">
    <user-settings>
      <edit-user :user="state.currentUser"></edit-user>
    </user-settings>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { UserSettings, EditUser } from '../components/';
import { UserState } from '@holeshot/vue2-user/src/store';
import { State } from 'vuex-class';

@Component({
  components: {
    UserSettings,
    EditUser,
  },
})
export default class Settings extends Vue {
  @State('User') state!: UserState;
}
</script>
