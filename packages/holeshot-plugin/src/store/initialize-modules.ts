import { Store } from "vuex";
import { SearchModule } from "./search-store";
import { getModule } from "vuex-module-decorators";
import { SchedulerModule } from "./scheduler-module";

let searchModule: SearchModule;
let schedulerModule: SchedulerModule;

export function initializeModules(store: Store<any>): void {
  schedulerModule = getModule(SchedulerModule, store);
  searchModule = getModule(SearchModule, store);
}

export { searchModule, schedulerModule };
