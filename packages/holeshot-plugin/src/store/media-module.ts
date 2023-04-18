import { HoleshotModule } from "./base-module";
import { MediaState } from "./state";
import { Action, Module, Mutation } from "vuex-module-decorators";

@Module({ namespaced: true, name: "Media" })
export class MediaModule extends HoleshotModule implements MediaState {

}
