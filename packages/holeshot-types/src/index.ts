export interface Entity {
  id: string;
  name: string;
}

export interface Track extends Entity {

}

export interface Event extends Entity {
  date: Date;
  url: string;
  details: Array<Array<string>>,
  track: { id: string }
}

export interface SwipeableEvent extends Event {
  visible: boolean;
}
