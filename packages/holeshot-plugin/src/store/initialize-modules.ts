import { Store } from "vuex";
import { SearchModule } from "./search-store";
import { getModule } from "vuex-module-decorators";

let searchModule: SearchModule;

export function initializeModules(store: Store<any>): void {
  searchModule = getModule(SearchModule, store);
}

export { searchModule };
