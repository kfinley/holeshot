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
      "UserEvent",
      `USER#${userId}#Event`,
      params.event.date,
      {
        track: params.track,
        event: params.event,
      },
      "Scheduler/addedToSchedule"
    );

    super.mutate((state: SchedulerState) => {
      if (state.schedule == null) {
        state.schedule = {
          events: [],
          tracks: [],
        };

        state.schedule.events = this.addOrUpdate(
          params.event,
          state.schedule.events,
          (e) => e.name == params.event.name
        );

        state.schedule.tracks = this.addOrUpdate(
          params.track,
          state.schedule.tracks,
          (t) => t.name == params.track.name
        );
      }
    });
  }

  @Action
  addedToSchedule(params: { track: Track; event: Event }) {
    console.log(params);

    //TODO: notify

    super.mutate((s: SchedulerState) => s.status == Status.None);
  }

  addOrUpdate<T>(
    item: T,
    items: Array<T>,
    predicate: (value: T, index: number, obj: T[]) => unknown
  ): Array<T> {
    const index = items.findIndex(predicate);
    //Not found, add on end.
    if (-1 === index) {
      return [...items, item];
    }
    //found, so return:
    //Clone of items before item being update.
    //updated item
    //Clone of items after item being updated.
    return [...items.slice(0, index), item, ...items.slice(index + 1)];
  };
}
