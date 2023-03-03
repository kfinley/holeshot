<template>
  <div>
    <h1>Functions</h1>
    <form @submit.prevent="onSubmit" autocomplete="off" role="form text-left">
      <input name="functionName" v-model="functionName" />
      <textarea name="functionPayload" v-model="functionPayload" />
      <button type="submit" class="btn primary-gradient w-100 my-4 mb-2">Log in</button>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import { getWSModule } from '../store/ws-module';

@Component({})
export default class Functions extends Vue {
  @Ref() readonly functionNameElement!: HTMLInputElement;
  @Ref() readonly functionPayloadElement!: HTMLInputElement;

  functionName = '';
  functionPayload = '';

  onSubmit() {
    getWSModule(this.$store).sendCommand({
      command: 'RunLambda',
      data: {
        name: this.functionName,
        payload: this.functionPayload,
      },
    });
  }
}
</script>

<style lang="scss" scoped></style>
