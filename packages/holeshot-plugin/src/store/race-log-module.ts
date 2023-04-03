
import { Event, Track, Actions, RaceLog } from "@holeshot/types/src";
import { Action, Module, Mutation } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { RaceLogState, SchedulerState, Status } from "./state";
import { notificationModule } from "@finley/vue2-components/src/store";

@Module({ namespaced: true, name: "RaceLog" })
export class RaceLogModule extends HoleshotModule implements RaceLogState {
  viewState: "View" | "Edit" = "View";
  status: Status = Status.None;
  active: RaceLog | null = null;
  logs: RaceLog[] = [];

  @Action
  init(params: { event: Event }) {
    if (this.active == null) {
      super.mutate((s: RaceLogState) => {
        s.active = {
          event: params.event,
          attributes: {},
        };
        s.viewState = "Edit";
      });
    }
  }

  @Action
  edit() {
    super.mutate((s: RaceLogState) => {
      s.viewState = "Edit";
    });
  }

  @Action
  save() {
    
    //TODO: push command...

    super.mutate((s: RaceLogState) => {
      s.viewState = "View";
    });

  }
}
