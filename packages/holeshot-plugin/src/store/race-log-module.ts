
import { Event, Track, Actions, RaceLog } from "@holeshot/types/src";
import { Action, Module, Mutation } from "vuex-module-decorators";
import { HoleshotModule } from "./base-module";
import { RaceLogState, SchedulerState, Status } from "./state";
import { notificationModule } from "@finley/vue2-components/src/store";

@Module({ namespaced: true, name: "RaceLog" })
export class RaceLogModule extends HoleshotModule implements RaceLogState {
  viewState: "View" | "Edit" = "View";
  status: Status = Status.None;
  active: RaceLog | null = {
    event: {
      date: "2023-03-27T00:00:00",
      trackName: "Hornet`s Nest BMX",
      track: {
        name: "Hornet`s Nest BMX",
        district: "SC1",
        location: {
          mapLink:
            "http://maps.google.com/maps?q=35.320255,-80.872293&iwloc=A&iwd=1",
          address: {
            state: "Nc",
            line2: "",
            city: "Charlotte",
            line1: "6301 Beatties Ford Rd",
            postalCode: "28216",
          },
          gps: {
            lat: "35.320255",
            long: "-80.872293",
          },
        },
      },
      created: "2023-03-07T23:07:36.561Z",
      eventType: "Practice",
      details: {
        description:
          "Timing is available for the best training in the Carolina’s",
        registrationEnd: "2pm",
        registrationStart: "10am",
        type: "Practice",
        raceTime: "10am",
        fee: "$0.00 USD",
      },
      url: "www.usabmx.com/tracks/1316/events/511020",
      name: "Practice",
    },
    attributes: {
      description: "foo",
    }
  };
  logs: RaceLog[] = [];
}
