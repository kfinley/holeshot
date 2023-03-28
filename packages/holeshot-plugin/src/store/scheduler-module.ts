import { Event, Track, Actions } from "@holeshot/types/src";
import { Action, Module, Mutation } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { SchedulerState, Status } from "./state";
import { notificationModule } from "@finley/vue2-components/src/store";

@Module({ namespaced: true, name: "Scheduler" })
export class SchedulerModule extends HoleshotModule implements SchedulerState {
  schedule: Event[] | null = null;
  status: Status = Status.None;

  timeout?: number;
  //TODO: currently hardcoded to adjust to pacific time
  today = new Date(new Date().setHours(-7, 0, 0, 0))
    .toJSON()
    .replace(".000Z", "");

  @Action
  [Actions.Scheduler.setPrevious](params: { schedule: Event[] }): void {
    super.mutate((state: SchedulerState) => {
      if (state.schedule == null) {
        state.schedule = params.schedule;
      } else {
        params.schedule.map((event) =>
          this.context.commit("updateSchedule", { event })
        );
      }
      state.status = Status.Loaded;
    });
  }

  @Action
  [Actions.Scheduler.setUpcoming](params: { schedule: Event[] }): void {
    super.mutate((state: SchedulerState) => {
      if (state.schedule == null) {
        state.schedule = params.schedule;
      } else {
        params.schedule.map((event) =>
          this.context.commit("updateSchedule", { event })
        );
      }
      state.status = Status.Loaded;
    });
  }

  @Action
  addToSchedule(params: { track: Track; event: Event }): void {
    try {
      notificationModule.dismissAll();

      params.event.track = params.event.track ?? params.track;

      super.mutate((state: SchedulerState) => {
        state.status = Status.Saving;
      });

      this.timeout = super.sendCommand({
        name: "AddEntity",
        payload: {
          pk: `USER#${this.context.rootState.User.currentUser.username}#EVENT`,
          sk: params.event.date,
          type: "Event",
          entity: params.event,
          responseCommand: "Scheduler/addedToSchedule",
        },
        onTimeout: () => {
          super.mutate((state: SchedulerState) => (state.status = Status.None));
          notificationModule.setError({
            message: "Error while adding event to schedule",
          });
        },
      });
      this.context.commit("updateSchedule", { event: params.event });
    } catch (e) {
      console.log("Error in addToSchedule: ", e);
      notificationModule.setError({
        message: "Error while adding event to schedule",
      });
    }
  }

  @Action
  async removeFromSchedule(params: { event: Event }): Promise<void> {
    try {
      notificationModule.dismissAll();

      super.mutate((state: SchedulerState) => {
        state.status = Status.Saving;
      });

      this.timeout = super.sendCommand({
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
          notificationModule.setError({
            message: "Error while removing event from schedule",
          });
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
  addedToSchedule(params: unknown): void {
    console.log(params);
    clearTimeout(this.timeout);
    super.mutate((s: SchedulerState) => s.status == Status.None);
  }

  @Action
  removedFromSchedule(params: unknown): void {
    console.log(params);
    clearTimeout(this.timeout);

    super.mutate((s: SchedulerState) => s.status == Status.None);
  }

  @Mutation
  updateSchedule(params: { event: Event }) {
    this.schedule = super.addSorted<Event>(
      params.event,
      this.schedule,
      {
        name: params.event.name,
        trackName: params.event.trackName,
        date: params.event.date,
      },
      (e) => e.date > params.event.date
    );
  }

  get upcomingEvents(): Event[] | undefined {
    return this.schedule?.filter((e) => e.date >= this.today);
  }

  get previousEvents(): Event[] | undefined {
    return this.schedule?.filter((e) => e.date < this.today);
  }
}
