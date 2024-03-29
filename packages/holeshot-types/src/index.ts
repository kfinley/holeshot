export * from './actions';

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

export interface GPS { lat: string | number, long: string | number }

export interface Location {
  address: Address;
  mapLink: string;
  gps: GPS;
}

export interface Coach {
  name: string;
  link: string;
}

export interface Sponsor {
  name: string;
  link: string;
}
export interface TrackInfo extends Track {
  trackId: string;
  contactInfo: Record<string, string>;
  logoUrl?: string;
  website: string;
  htmlDescription: string;
  socials: Record<string, string>;
  sponsors: Sponsor[];
  coaches: Coach[];
  operators: string[];
}

export interface Event extends Entity {
  date: Date | string;
  url: string;
  trackName: string;
  eventType: string;
  details: Record<string, string>;
  track?: Track;
  hasRaceLog: boolean | null;
}

//TODO: Refactor this out...
export interface SwipeableEvent extends Event {
  visible: boolean;
}

export interface Track extends Entity {
  district: string;
  location: Location,
}

export interface RaceLog extends Entity {
  event: Event;
  attributes: Record<string, any>;
  media: Record<string, Media>
}

export interface Media extends Entity {
  
}
