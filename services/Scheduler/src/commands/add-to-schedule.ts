import { injectable } from "inversify";
import { Command } from "@holeshot/commands/src";
import { Track, Event } from "@holeshot/types/src";

export type AddToScheduleRequest = {
  track: Track;
  event: Event;
}

export type AddToScheduleResponse = {
  success: boolean;
}

@injectable()
export class AddToScheduleCommand implements Command<AddToScheduleRequest, AddToScheduleResponse> {

  async runAsync(params: AddToScheduleRequest): Promise<AddToScheduleResponse> {
    console.log(params);
    return {
      success: true
    }
  }

}
