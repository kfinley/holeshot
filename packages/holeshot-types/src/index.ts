//TODO: Refactor this up...
export interface Entity {
  id?: string;
  name?: string;
}

//TODO: Refactor this up...
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface GPS { lat: string, long: string }
export interface Location {
  address: Address;
  mapLink: string;
  gps: GPS;
}

export interface TrackInfo extends Entity {
  district: string;
  contactInfo: Record<string, string>;
  logoUrl?: string;
  location: Location;
  website: string;
  htmlDescription: string;
  socials: Record<string, string>;
  sponsors: Record<string, string>;
  coaches: Record<string, string>;
  operators: string[] | Record<string, string>;
  events: Event[];
}

export interface Event extends Entity {
  date: Date | string;
  url: string;
  details: Record<string, string>;
}

//TODO: Refactor this out...
export interface SwipeableEvent extends Event {
  visible: boolean;
}
