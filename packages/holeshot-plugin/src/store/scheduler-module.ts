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
  addToSchedule(params: { track: Track; event: Event }) {
    const userId = ""; //TODO: get from user store in base class method

    super.mutate((state: SchedulerState) => {
      state.status = Status.Saving;
    });

    super.addEntity(
      "Track",
      `USER#${userId}#Event`,
      params.event.trackName,
      params.event.trackName,
      "Scheduler/addedToSchedule"
    );

    super.addEntity(
      "Event",
      `USER#${userId}#Event`,
      params.event.date,
      params.event,
      "Scheduler/addedToSchedule"
    );

    super.mutate((state: SchedulerState) => {
      if (state.schedule == null) {
        state.schedule = {
          events: [],
          tracks: [],
        };

        state.schedule.events = super.addOrUpdate(
          params.event,
          state.schedule.events,
          (e) => e.name == params.event.name && e.date == params.event.date
        );

        state.schedule.tracks = super.addOrUpdate(
          params.track,
          state.schedule.tracks,
          (t) => t.name == params.track.name
        );
      }
    });
  }

  @Action
  addedToSchedule(params: any) {
    console.log(params);

    //TODO: notify

    super.mutate((s: SchedulerState) => s.status == Status.None);
  }
}