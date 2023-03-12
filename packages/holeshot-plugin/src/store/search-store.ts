import { Action, Module } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { SearchEventsInput, SearchState, SearchStatus } from "./state";

@Module({ namespaced: true, name: "Search" })
export class SearchModule extends HoleshotModule implements SearchState {
  status: SearchStatus = SearchStatus.Loaded;
  searchInput: SearchEventsInput | null = null;
  showCriteriaPanel: boolean = false;

  //todo: pull from profile and allow input.
  defaultLocation = {
    lat: 34.9744394,
    long: -80.9667001,
  };

  // searchResult: [] = [];

  @Action
  search() {
    console.log("search", this.searchInput);
    this.context.commit('mutate', (state: SearchState) => {
      state.showCriteriaPanel = false;
    });
    this.sendCommand({
      name: "GetNearbyEvents",
      payload: {
        lat: this.defaultLocation.lat,
        long: this.defaultLocation.long,
        startDate: this.searchInput?.startDate,
        endDate: this.searchInput?.endDate,
        distance: this.searchInput?.distance,
        name: this.searchInput?.name,
        type: this.searchInput?.type,
      },
    });
  }

  @Action
  openCriteriaPanel() {
    this.context.commit('mutate', (state: SearchState) => {
      state.showCriteriaPanel = true;
    });
  }

}

// export const getSearchModule = (store: Store<any>) => getModule(SearchModule, store);
