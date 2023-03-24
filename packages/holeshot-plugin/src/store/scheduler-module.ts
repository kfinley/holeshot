import { Event, Track } from "@holeshot/types/src";
import { Action, Module } from "vuex-module-decorators";
import { HoleshotModule, less } from "./base-module";
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
      const { username } = this.context.rootState.User.currentUser;

      console.log(username);

      params.event.track = params.event.track ?? params.track;

      super.mutate((state: SchedulerState) => {
        state.status = Status.Saving;
      });

      super.sendCommand({
        name: "AddEntity",
        payload: {
          pk: `USER#${username}#EVENT`,
          sk: params.event.date,
          type: "Event",
          entity: params.event,
          responseCommand: "Scheduler/addedToSchedule",
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
    }
  }

  @Action
  async removeFromSchedule(params: { event: Event }) {
    try {
      const { username } = this.context.rootState.User.currentUser;

      console.log(username);

      super.sendCommand({
        name: "DeleteEntity",
        payload: {
          pk: `USER#${username}#EVENT`,
          sk: params.event.date,
          responseCommand: "Scheduler/removedFromSchedule",
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
    }
  }

  @Action
  addedToSchedule(params: any) {
    console.log(params);

    //TODO: notify

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
