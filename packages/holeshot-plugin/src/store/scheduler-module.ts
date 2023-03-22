import { Event, Track } from "@holeshot/types/src";
import { Action, Module } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { SchedulerState, Status } from "./state";

@Module({ namespaced: true, name: "Scheduler" })
export class SchedulerModule extends HoleshotModule implements SchedulerState {
  schedule: Event[] | null = null;
  status: Status = Status.None;

  @Action
  setSchedule(params: { connectionId: string; schedule: Event[] }) {
    super.mutate((state: SchedulerState) => {
      state.schedule = params.schedule;
      state.status = Status.Loaded;
    });
  }

  @Action
  addToSchedule(params: { track: Track; event: Event }) {
    try {
      const username = super.getUsername;
      params.event.track = params.event.track ?? params.track;

      super.mutate((state: SchedulerState) => {
        state.status = Status.Saving;
      });

      super.addEntity(
        "Event",
        `USER#${username}#EVENT`,
        params.event.date,
        params.event,
        "Scheduler/addedToSchedule"
      );

      super.mutate((state: SchedulerState) => {
        if (state.schedule == null) {
          state.schedule = [];

          state.schedule = super.addOrUpdate(
            params.event,
            state.schedule,
            (e) => e.name == params.event.name && e.date == params.event.date
          );
        }
      });
    } catch (e) {
      console.log("Error in addToSchedule: ", e);
    }
  }

  removeFromSchedule(params: { event: Event }) {
    try {
      const username = super.getUsername;
      super.updateEntity(
        `USER#${username}#EVENT`,
        params.event.date as string,
        "SET isActive = 0",
        "Scheduler/removedFromSchedule"
      );

      super.mutate((s: SchedulerState) => {
        s.schedule =
          s.schedule?.filter(
            (e) => e.name !== params.event.name && e.date !== params.event.date
          ) ?? null;
      });
    } catch (e) {
      console.log("Error in removeFromSchedule", e);
    }
  }

  @Action
  addedToSchedule(params: any) {
    console.log(params);

    //TODO: notify

    super.mutate((s: SchedulerState) => s.status == Status.None);
  }

  get upcomingEvents() {
    return this.schedule?.filter(
      (e) => e.date >= new Date(new Date().setHours(0, 0, 0, 0)).toJSON()
    );
  }
}
