import { Prop } from "vue-property-decorator";
import BaseControl from "./base-control";
import { Entity } from "@holeshot/types/src";
import { SearchState, SearchStatus } from '../store/state';
import { State } from "vuex-class";

export default class SearchControl<T extends Entity> extends BaseControl {

  @State("Search") state!: SearchState;

  @Prop()
  items!: Array<T>;

  item!: T;
  previousItem!: T;

  searchResults: Array<T> = [];
  query? = "";
  previousQuery = "";

  mounted() {
    this.setMaxWidth();
    this.setItemWidth();
  }

  onSelect(item: T) {
    console.log("onSelect");
    console.log(item);
    this.query = item.name;
    this.previousQuery = "";





    //TODO: refactor to use store module
    this.searchResults = this.items.filter((t) =>
      t.name?.includes(item.name as string)
    );



    
  }

  searchFocusIn() {
    console.log("focusIn");
    if (this) {
      console.log(this.previousQuery);
      console.log(this.query);
    }
  }

  searchFocusOut() {
    console.log("focusOut");
    if (this) {
      console.log(this.previousQuery);
      console.log(this.query);
    }
  }

  searchUpdate(input: string) {
    if (input == "") {
      this.query = "";
    }
  }

  searchReset(typeAheadInstance: any) { // ugh....
    console.log("searchReset");
    if (this) {
      if (typeAheadInstance.query === "") {
        this.query = this.previousQuery;
      } else {
        // this.previousQuery = typeAheadInstance.query;
      }
      console.log(this.query);
      console.log(this.previousQuery);
    }
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

  get searching() {
    return this.state.status == SearchStatus.Searching;
  }

}
