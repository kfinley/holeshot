<template>
  <div v-if="hasTracks">
    <div v-for="(track, index) in tracks" :key="index">
      <card class="track" showClose="false">
        <entity :entity="track">
          <template v-slot:expand>Track Properties</template>
        </entity>
      </card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Track } from "@holeshot/types/src";
import Entity from "vue2-components/src/components/entity.vue";
import Card from "vue2-components/src/components/card.vue";

@Component({
  components: {
    Card,
    Entity,
  },
})
export default class TrackList extends Vue {
  @Prop()
  tracks!: Array<Track>;

  get hasTracks() {
    return this.tracks?.length > 0;
  }
}
</script>
