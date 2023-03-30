import { Store } from "vuex";
import { SearchModule } from "./search-store";
import { getModule } from "vuex-module-decorators";
import { SchedulerModule } from "./scheduler-module";
import { RaceLogModule } from "./race-log-module";

let searchModule: SearchModule;
let schedulerModule: SchedulerModule;
let raceLogModule: RaceLogModule;

export function initializeModules(store: Store<any>): void {
  schedulerModule = getModule(SchedulerModule, store);
  searchModule = getModule(SearchModule, store);
  raceLogModule = getModule(RaceLogModule, store);
}

export { searchModule, schedulerModule, raceLogModule };
