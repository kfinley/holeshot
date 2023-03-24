import { Event, Track } from "@holeshot/types/src";
import { Action, Module } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { SchedulerState, Status } from "./state";
import { notificationModule } from "@finley/vue2-components/src/store";

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
      notificationModule.dismissAll();

      params.event.track = params.event.track ?? params.track;

      super.mutate((state: SchedulerState) => {
        state.status = Status.Saving;
      });

      super.sendCommand({
        name: "AddEntity",
        payload: {
          pk: `USER#${this.context.rootState.User.currentUser.username}#EVENT`,
          sk: params.event.date,
          type: "Event",
          entity: params.event,
          responseCommand: "Scheduler/addedToSchedule",
        },
        onTimeout: () => {
          //TODO: handle this better.
          // for now just blowing by timeouts b/c nothing is looking at status.
          super.mutate((state: SchedulerState) => (state.status = Status.None));
        },
      });

      super.mutate((state: SchedulerState) => {
        state.schedule = super.addSorted<Event>(
          params.event,
          state.schedule,
          {
            name: params.event.name,
            trackName: params.event.trackName,
            date: params.event.date,
          },
          (e) => e.date > params.event.date
        );
      });
    } catch (e) {
      console.log("Error in addToSchedule: ", e);
      notificationModule.setError({
        message: "Error while adding event to schedule",
      });
    }
  }

  @Action
  async removeFromSchedule(params: { event: Event }) {
    try {
      notificationModule.dismissAll();

      super.mutate((state: SchedulerState) => {
        state.status = Status.Saving;
      });

      super.sendCommand({
        name: "DeleteEntity",
        payload: {
          pk: `USER#${this.context.rootState.User.currentUser.username}#EVENT`,
          sk: params.event.date,
          responseCommand: "Scheduler/removedFromSchedule",
        },
        onTimeout: () => {
          //TODO: handle this better.
          // for now just blowing by timeouts b/c nothing is looking at status.
          super.mutate((state: SchedulerState) => (state.status = Status.None));
        },
      });

      super.mutate((s: SchedulerState) => {
        s.schedule =
          s.schedule?.filter(
            (e) =>
              !(e.name === params.event.name && e.date === params.event.date)
          ) ?? null;
      });
    } catch (e) {
      console.log("Error in removeFromSchedule", e);
      notificationModule.setError({
        message: "Error while removing event from schedule",
      });
    }
  }

  @Action
  addedToSchedule(params: any) {
    console.log(params);
    super.mutate((s: SchedulerState) => s.status == Status.None);
  }

  @Action
  removedFromSchedule(params: any) {
    console.log(params);
    super.mutate((s: SchedulerState) => s.status == Status.None);
  }

  get upcomingEvents() {
    return this.schedule?.filter(
      (e) => e.date >= new Date(new Date().setHours(0, 0, 0, 0)).toJSON()
    );
  }
}
