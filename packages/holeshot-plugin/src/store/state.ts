import { Event, GPS, RaceLog } from "@holeshot/types/src";

export enum Status {
  None = "None",
  Loading = "Loading",
  Loaded = "Loaded",
  Failed = "Failed",
  Saving = "Saving",
}

export enum SearchStatus {
  Edit = "Edit",
  Failed = "Failed",
  Loaded = "Loaded",
  None = "None",
  Searching = "Searching",
}

export interface SearchState {
  status: SearchStatus;
  searchInput: SearchEventsInput | null;
  showCriteriaPanel: boolean;
  searchResults: Record<string, any> | null;
  location: GPS | null;
}

export interface SearchEventsInput {
  startDate: Date | string;
  endDate: Date | string;
  type: string;
  name?: string;
  location?: string;
  distance: number;
}

export interface SchedulerState {
  status: Status;
  schedule: Event[] | null;
}

export interface RaceLogState {
  viewState: "View" | "Edit";
  status: Status;
  active: RaceLog | null;
  logs: Array<RaceLog>;
}
