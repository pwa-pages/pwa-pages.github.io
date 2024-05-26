
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export enum EventType {
  StartDownload = 'BeginDownload',
  EndDownload = 'EndDownload',
  InputsStoredToDb = 'InputsStoredToDb',
  SwipeActivated = 'SwipeActivated',
  SwipeDeActivated = 'SwipeDeActivated'
}


@Injectable({
  providedIn: 'root'
})

export class EventService {

  eventSubscriptions: {
    [key in EventType]: Subject<any>
  } = this.resetSubscriptions();


  constructor() {


  }
  ngOnDestroy(): void {

  }

  resetSubscriptions() {
    this.eventSubscriptions = {
      [EventType.StartDownload]: new Subject<any>,
      [EventType.EndDownload]: new Subject<any>,
      [EventType.InputsStoredToDb]: new Subject<any>,
      [EventType.SwipeActivated]: new Subject<any>,
      [EventType.SwipeDeActivated]: new Subject<any>
    };
    return this.eventSubscriptions;
  }

  async sendEvent(eventType: EventType) {
    console.log('Received event: ' + eventType);

    this.eventSubscriptions[eventType].next(eventType);
  }

  async subscribeToEvent(eventType: EventType, callback: () => void) {
    this.eventSubscriptions[eventType].subscribe(callback);
  }

  async unSubscribeAll(events: EventType[]) {

    for (const eventType of events) {
      console.log('Unsubscribing all from ' + eventType);
      this.eventSubscriptions[eventType].unsubscribe();
      this.eventSubscriptions[eventType] = new Subject<any>;
    }


  }
}