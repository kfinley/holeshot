import { Event } from '@holeshot/types/src';
import { Store } from 'vuex';
import { Action, getModule, Module } from 'vuex-module-decorators';
import BaseModule from './base-module';
import { EventsState, Status } from './state';

@Module({ namespaced: true, name: 'Events' })
export class EventsModule extends BaseModule implements EventsState {
  myEvents: Event[] = [];
  status: Status = Status.None;
  searchResult: [] = [];

  @Action
  nearby(params: { connectionId: string; events: [] }) {
    console.log('Events nearby', params);

    this.context.commit('mutate', (state: EventsState) => {
      state.searchResult = params.events;
    });
  }
}

export const getEventsModule = (store: Store<any>) => getModule(EventsModule, store);
