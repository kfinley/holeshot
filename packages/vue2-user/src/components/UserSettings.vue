<template>
  <div>
    <h3 align="center">User Settings</h3>
    <card>
      <entity v-if="!editing" :entity="state.currentUser" :exclude="exclude">
        <template v-slot:expand />
      </entity>
      <slot v-else></slot>
      <div slot="footer">
        <Button v-if="!editing" @click="edit"> Edit </Button>
        <Button v-else @click="save"> Save </Button>
      </div>
    </card>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Entity from '@finley/vue2-components/src/components/entity.vue';
import Card from '@finley/vue2-components/src/components/card.vue';
import { UserState } from '../store';
import { State } from 'vuex-class';
import BaseControl from '@finley/vue2-components/src/components/base-control';

@Component({
  components: {
    Entity,
    Card,
  },
})
export default class UserSettings extends BaseControl {
  @State('User') state!: UserState;

  editing = false;
  @Prop() exclude?: string[];

  edit() {
    this.editing = !this.editing;
  }

  save() {
    this.editing = !this.editing;
  }
}
</script>
