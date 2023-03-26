import { Action, Module, } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { SearchEventsInput, SearchState, SearchStatus } from "./state";
import { notificationModule } from "@finley/vue2-components/src/store";
import { GPS } from "@holeshot/types/src";

@Module({ namespaced: true, name: "Search" })
export class SearchModule extends HoleshotModule implements SearchState {
  status: SearchStatus = SearchStatus.Loaded;
  searchInput: SearchEventsInput | null = null;
  searchResults: Record<string, unknown> | null = null;
  showCriteriaPanel = false;
  location: GPS | null = null;

  timeoutId?: number;

  // Rock Hill, NC Track GPS
  defaultLocation = {
    lat: 34.9744394,
    long: -80.9667001,
  };

  @Action
  setLocation(): void {
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        super.mutate((state: SearchState) => {
          state.location = {
            lat: loc.coords.latitude,
            long: loc.coords.longitude,
          };

          console.log(
            "Current Lat & Long: [",
            state.location.lat,
            ",",
            state.location.long,
            "]"
          );
        });
      },
      (err) => {
        console.log("Error", err);
      }
    );
  }

  @Action
  search(): void {

    notificationModule.dismissAll();

    super.mutate((state: SearchState) => {
      state.showCriteriaPanel = false;
      state.status = SearchStatus.Searching;
      state.searchResults = null;
    });

    this.timeoutId = super.sendCommand({
      name: "GetNearbyEvents",
      payload: {
        lat: this.location ? this.location.lat : this.defaultLocation.lat,
        long: this.location ? this.location.long : this.defaultLocation.long,
        startDate: this.searchInput?.startDate,
        endDate: this.searchInput?.endDate,
        distance: this.searchInput?.distance,
        name: this.searchInput?.name,
        type: this.searchInput?.type,
      },
      onTimeout: () => {
        if (this.status == SearchStatus.Searching) {
          notificationModule.setError({
            message: `Sorry, the search took too long.<br/>Refine your search and try again.`,
          });
          super.mutate(
            (state: SearchState) => (state.status = SearchStatus.Loaded)
          );
        }
      }
    });
  }

  @Action
  getNearbyEventsResponse(params: {
    searched: number;
    events: [];
    tracks: [];
  }): void {
    console.log("getNearbyEventsResponse", params);
    clearTimeout(this.timeoutId);

    if (this.status == SearchStatus.Searching) {
      super.mutate((state: SearchState) => {
        state.status = SearchStatus.Loaded;
        state.searchResults = {
          searched: params.searched,
          events: params.events,
          tracks: params.tracks,
        };
      });
    }
  }

  @Action
  openCriteriaPanel(): void {
    super.mutate((state: SearchState) => {
      state.showCriteriaPanel = true;
    });
  }
}
