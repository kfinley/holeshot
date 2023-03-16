import { Event, Track } from "@holeshot/types/src";
import { Action, Module } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { SchedulerState, Status } from "./state";

@Module({ namespaced: true, name: "Scheduler" })
export class SchedulerModule extends HoleshotModule implements SchedulerState {
  schedule: { tracks: Track[]; events: Event[] } | null = null;
  status: Status = Status.None;

  @Action
  setSchedule(params: {
    connectionId: string;
    tracks: Track[];
    events: Event[];
  }) {
    super.mutate((state: SchedulerState) => {
      state.schedule = {
        tracks: params.tracks,
        events: params.events,
      };
      state.status = Status.Loaded;
    });
  }

  @Action
  addToSchedule(params: { track: Track;  event: Event }) {
    super.sendCommand({
      name: "AddToSchedule",
      payload: {
        track: params.track,
        event: params.event,
      },
    });
  }
}
