/* eslint-disable prettier/prettier */
import { Event, Actions, RaceLog } from "@holeshot/types/src";
import { Action, Module, Mutation } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { RaceLogsState, Status } from "./state";
import { notificationModule } from "@finley/vue2-components/src/store";

@Module({ namespaced: true, name: "RaceLogs" })
export class RaceLogsModule extends HoleshotModule implements RaceLogsState {
  viewState: "View" | "Edit" = "View";
  status: Status = Status.None;
  original: RaceLog | null = null;
  active: RaceLog | null = null;
  logs: RaceLog[] = [];

  timeout?: number;

  @Action
  [Actions.RaceLogs.setLogs](params: { logs: RaceLog[] }) {
    super.mutate((state: RaceLogsState) => {
      params.logs.map((log) => this.context.commit("updateLogs", { log }));
      state.status = Status.Loaded;
    });
  }

  @Action
  init(params: { event: Event }) {
    if (this.active == null) {
      let viewState: "View" | "Edit" = "View";

      let log = this.logs.find(
        (log: RaceLog) =>
          log.event.name == params.event.name &&
          log.event.trackName == params.event.trackName &&
          log.event.date == params.event.date
      );

      if (log == undefined) {
        console.log('no log found');
        viewState = "Edit";
        log = {
          event: params.event,
          attributes: {},
        };
        super.mutate((s: RaceLogsState) => s.logs.push(log as RaceLog));
      }

      super.mutate((s: RaceLogsState) => {
        s.original = log as RaceLog;
        s.active = structuredClone(s.original);
        s.viewState = viewState;
      });
    }
  }

  @Action
  cancel() {
    super.mutate((s: RaceLogsState) => {
      s.viewState = "View";
      s.active = structuredClone(s.original);
    });
  }

  @Action
  close() {
    super.mutate((s: RaceLogsState) => {
      s.viewState = "View";
      s.active = null;
      s.original = null;
    });
  }
  @Action
  edit() {
    super.mutate((s: RaceLogsState) => {
      s.viewState = "Edit";
    });
  }

  @Action
  save() {
    if (this.active == null) {
      notificationModule.setError({
        message: "Error saving log. Active race log is null",
      });
    } else {
      // console.log("saved log", this.active);

      this.timeout = super.sendCommand({
        name: "PutEntity",
        payload: {
          pk: `USER#${this.context.rootState.User.currentUser.username}#RACELOG`,
          sk: this.active.event.date,
          type: "RaceLog",
          entity: this.active,
          responseCommand: "RaceLogs/logSaved",
        },
        onTimeout: () => {
          super.mutate((state: RaceLogsState) => (state.status = Status.None));
          notificationModule.setError({
            message: "Error while saving race log",
          });
        },
      });

      this.context.commit("updateLogs", { log: structuredClone(this.active) });

      super.mutate((s: RaceLogsState) => {
        s.viewState = "View";
        s.original = s.active;  //TODO: ....
        s.active = structuredClone(s.original);
      });
    }
  }

  @Action
  logSaved(params: unknown) {
    console.log(params);
    clearTimeout(this.timeout);
  }

  @Mutation
  updateLogs(params: { log: RaceLog }) {
    this.logs = super.addOrUpdate<RaceLog>(params.log, this.logs, {
      'event.name': params.log.event.name,
      'event.trackName': params.log.event.trackName,
      'event.date': params.log.event.date,
    });
  }
}
