
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
      let viewState = "View";

      let log = this.logs.find(
        (log: RaceLog) =>
          log.event.name == params.event.name &&
          log.event.trackName == params.event.trackName &&
          log.event.date == params.event.date
      );
      if (log == undefined) {
        viewState = "Edit";
        log = {
          event: params.event,
          attributes: {},
        };
      }

      super.mutate((s: RaceLogState) => {
        s.logs.push(log);
        s.active = log;
        s.viewState = viewState;
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
    console.log("saved log", this.active);
    //TODO: push command...

    super.mutate((s: RaceLogState) => {
      s.viewState = "View";
    });
  }
}
