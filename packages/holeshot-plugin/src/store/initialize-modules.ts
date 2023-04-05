import { Store } from "vuex";
import { SearchModule } from "./search-store";
import { getModule } from "vuex-module-decorators";
import { SchedulerModule } from "./scheduler-module";
import { RaceLogsModule } from "./race-logs-module";

let searchModule: SearchModule;
let schedulerModule: SchedulerModule;
let raceLogsModule: RaceLogsModule;

export function initializeModules(store: Store<any>): void {
  schedulerModule = getModule(SchedulerModule, store);
  searchModule = getModule(SearchModule, store);
  raceLogsModule = getModule(RaceLogsModule, store);
}

export { searchModule, schedulerModule, raceLogsModule };
