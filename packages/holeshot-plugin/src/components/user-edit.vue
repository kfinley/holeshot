<template>
  <div>
    <div v-for="(prop, index) in Object.keys(user)" :key="index">
      <div v-if="prop == 'GPS'">GPS Edit</div>
      <div v-if="include(prop)">{{ toSentence(prop) }}: {{ user[prop] }}</div>
    </div>
    <div>Lat: {{ lat }} Long: {{ long }}</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import BaseControl from "./base-control";
import { Component, Prop } from "vue-property-decorator";
import { User } from "@holeshot/types/src/user";

@Component({})
export default class UserEdit extends BaseControl {
  @Prop({ default: null })
  user!: User;

  lat: number | null = null;
  long: number | null = null;
  error: string | null = null;
  isMounted = false;
  timeoutId: number | null = null;

  mounted() {
    this.isMounted = true;
    this.getLocation();
  }

  getLocation() {
    if (this.isMounted)
      this.timeoutId = setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          (loc) => {
            this.lat = loc.coords.latitude;
            this.long = loc.coords.longitude;
            this.error = null;
            console.log("Current Lat & Long: [", this.lat, ",", this.long, "]");
          },
          (err) => {
            console.log("Error", err);
            this.error = err.message;
          }
        );
        this.getLocation();
      }, 1000);
  }

  include(prop: string) {
    return prop !== "username";
  }

  destroyed() {
    clearTimeout(this.timeoutId);
  }
}
</script>
