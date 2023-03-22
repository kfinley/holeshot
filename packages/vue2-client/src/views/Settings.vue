<template>
 <div class="p-4">
    <user-settings />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { UserSettings } from '../components/';

@Component({
  components: {
    UserSettings,
  },
})
export default class Settings extends Vue {}
</script>
