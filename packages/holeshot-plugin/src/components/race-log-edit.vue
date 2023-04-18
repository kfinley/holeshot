<template>
  <div class="row">
    <ValidationObserver ref="formObserver">
      <form
        @submit.prevent="addAttribute"
        autocomplete="off"
        role="form text-left"
        enctype="multipart/form-data"
      >
        <ValidationProvider
          name="name"
          rules="required"
          mode="passive"
          v-slot="{ errors }"
        >
          <input
            ref="fieldNameElement"
            placeholder="Field Name"
            :class="['form-control', { 'is-invalid': errors[0] }]"
            v-model="fieldName"
            @keyup.enter="addAttribute"
          />
          <div v-show="errors[0]" class="invalid-feedback">
            {{ errors[0] }}
          </div>
        </ValidationProvider>
        <Button class="mx-0 mt-2" @click="addAttribute">Add Field</Button>
        <Button class="mt-2 float-right">
          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            class="file-input"
            @change="filesChange($event)"
          />
          Upload Photos
        </Button>
      </form>
    </ValidationObserver>

    <div v-for="(attribute, key, index) in log.attributes" :key="index">
      <div>
        <h3>{{ key }}</h3>
        <textarea
          :id="key"
          class="attribute-field"
          v-model="log.attributes[key]"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Ref } from "vue-property-decorator";
import { ValidationProvider, ValidationObserver } from "vee-validate";
import BaseControl from "./base-control";
import { RaceLog } from "@holeshot/types/src";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class RaceLogEdit extends BaseControl {
  @Ref() readonly formObserver!: InstanceType<typeof ValidationObserver>;
  @Ref() readonly fieldNameElement!: HTMLInputElement;

  @Prop({ default: null })
  log: RaceLog;

  fieldName = "";

  get loaded() {
    return this.log != null;
  }

  async addAttribute() {
    const isValid = await this.formObserver.validate();
    if (isValid) {
      const field = this.fieldName.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });

      this.log.attributes[field] = "";
      this.fieldName = "";

      this.$forceUpdate();

      super.setFocus(field);
    }
  }

  filesChange($event) {
    console.log("filesChange", $event);
  }
}
</script>
<style scoped>
.attribute-field {
  width: 100%;
  height: 10em;
}

.file-input {
  opacity: 0;
  width: 100%;
  position: absolute;
  cursor: pointer;
}
</style>
