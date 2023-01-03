//TODO: Refactor this up...
export interface Entity {
  id: string;
  name?: string;
}
//TODO: Refactor this up...
export interface Address extends Entity {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface Track extends Entity {
  address: Address;
  district: string;
}

export interface Event extends Entity {
  date: Date;
  url: string;
  details: Array<Array<string>>,
  track: Track
}

//TODO: Refactor this out...
export interface SwipeableEvent extends Event {
  visible: boolean;
}

export * from './config';
