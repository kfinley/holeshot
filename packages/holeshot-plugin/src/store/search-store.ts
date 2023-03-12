import { Action, Module } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { SearchEventsInput, SearchState, SearchStatus } from "./state";

@Module({ namespaced: true, name: "Search" })
export class SearchModule extends HoleshotModule implements SearchState {
  status: SearchStatus = SearchStatus.Loaded;
  searchInput: SearchEventsInput | null = null;
  searchResults: Record<string, any> | null = null;
  showCriteriaPanel: boolean = false;

  //todo: pull from profile and allow input.
  defaultLocation = {
    lat: 34.9744394,
    long: -80.9667001,
  };

  @Action
  search() {
    console.log("search", this.searchInput);

    super.mutate((state: SearchState) => {
      state.showCriteriaPanel = false;
      state.status = SearchStatus.Searching;
      state.searchResults = null;
    });

    super.sendCommand({
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
  getNearbyEventsResponse(params: {
    searched: number;
    events: [];
    tracks: [];
  }) {
    console.log("getNearbyEventsResponse", params);
    super.mutate((state: SearchState) => {
      state.status = SearchStatus.Loaded;
      state.searchResults = {
        searched: params.searched,
        events: params.events,
        tracks: params.tracks,
      };
    });
  }

  @Action
  openCriteriaPanel() {
    super.mutate((state: SearchState) => {
      state.showCriteriaPanel = true;
    });
  }
}