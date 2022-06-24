<template>
  <div class="track-search">
    <type-ahead
      placeholder="Search for a track..."
      :items="items"
      :onSelect="onSelect"
      v-model="query"
      v-on:focusin="searchFocusIn"
      v-on:focusout="searchFocusOut"
      @reset="searchReset"
      @update="searchUpdate"
    >
    </type-ahead>
    <track-list id="results" :tracks="searchResults"> </track-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import TypeAhead from "vue2-components/src/components/type-ahead.vue";
import TrackList from "./track-list.vue";
import { Track } from "@holeshot/types/src";

@Component({
  components: {
    TrackList,
    TypeAhead,
  },
})
export default class TrackSearch extends Vue {
  
  @Prop()
  items!: Array<Track>;

  @Prop({ default: "85%" })
  maxWidth!: string;

  searchResults: Array<Track> = [];
  query = "";
  previousQuery = "";

  mounted() {
    this.setMaxWidth();
    this.setItemWidth();
  }

  onSelect(track: Track) {
    console.log("onSelect");
    console.log(track);
    this.query = track.name;
    this.previousQuery = "";
    //TODO: refactor to use store module

    this.searchResults = this.items.filter((t) => t.name.includes(track.name));
  }

  searchFocusIn() {
    console.log("focusIn");
    console.log(this.previousQuery);
    console.log(this.query);
  }

  searchFocusOut() {
    console.log("focusOut");
    console.log(this.previousQuery);
    console.log(this.query);
  }

  searchUpdate(input) {
    if (input == "") {
      this.query = "";
    }
  }

  searchReset(typeAheadInstance) {
    console.log("searchReset");
    if (typeAheadInstance.query === "") {
      this.query = this.previousQuery;
    } else {
      // this.previousQuery = typeAheadInstance.query;
    }
    console.log(this.query);
    console.log(this.previousQuery);
  }

  //TODO: refactor this.. We'll have more than on item type on a page that may need this set.
  setMaxWidth() {
    document.documentElement.style.setProperty("--max-width", this.maxWidth);
  }

  //TODO: refactor this.. We'll have more than on item type on a page that may need this set.
  setItemWidth() {
    const maxWidthAsPixels =
      window.innerWidth * (Number(this.maxWidth.replace("%", "")) * 0.01);
    const itemWidthAsPixels = maxWidthAsPixels - maxWidthAsPixels * 0.2;
    document.documentElement.style.setProperty(
      "--item-width",
      `${itemWidthAsPixels.toFixed(0).toString()}px`
    );
  }

  get searchHasResults() {
    return this.searchResults.length > 0;
  }
}
</script>

<style scoped>
.track-search {
  width: var(--item-width);
  max-width: var(--max-width);
}
</style>
