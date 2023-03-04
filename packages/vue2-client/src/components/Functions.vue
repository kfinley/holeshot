<template>
  <div>
    <h1>Run Lambda Function</h1>
    <form @submit.prevent="onSubmit" autocomplete="off" role="form text-left">
      <div>
        <input
          name="functionName"
          v-model="functionName"
        />
      </div>
      <div>
        <textarea name="functionPayload" v-model="functionPayload" />
      </div>
      <button type="submit" class="btn primary-gradient w-100 my-4 mb-2">
        Send Run Function Command
      </button>
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

  functionName = 'Holeshot-Infrastructure-GetNearbyEvents';
  functionPayload = `{
    "lat": 34.9744394,
    "long": -80.9667001,
    "date": "2023-03-01T00:00:00"
  }`;

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

<style lang="scss" scoped>
textarea {
  height: 350px;
}

textarea,
input {
  width: 100%;
}
</style>
