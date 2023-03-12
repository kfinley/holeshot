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
}

export interface SearchEventsInput {
  startDate: Date | string;
  endDate: Date | string;
  type: string;
  name?: string;
  distance: number;
}
