<template>
  <div>
    <div v-for="(prop, index) in Object.keys(user)" :key="index">
      <div v-if="prop == 'GPS'">GPS Edit</div>
      <div>{{ toSentence(prop) }}: {{ user[prop] }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import BaseControl from "./base-control";
import { Component, Prop } from "vue-property-decorator";
import { User } from "@holeshot/types/src/user";

@Component({})
export default class EditUser extends BaseControl {
  @Prop({ default: null })
  user!: User;

  mounted() {
    console.log("mounted");
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        console.log(
          "Current Lat & Long: [",
          loc.coords.latitude,
          ",",
          loc.coords.longitude,
          "]"
        );
      },
      (err) => {
        console.log("Error", err);
      }
    );
  }
}
</script>
