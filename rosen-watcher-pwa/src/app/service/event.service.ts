import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum EventType {
  StartFullDownload = 'StartFullDownload',
  EndFullDownload = 'EndFullDownload',
  InputsStoredToDb = 'InputsStoredToDb',
  SwipeActivated = 'SwipeActivated',
  SwipeDeActivated = 'SwipeDeActivated',
  StartDownload = 'StartDownload',
  EndDownload = 'EndDownload',
  SwipeVertical = 'SwipeVertical',
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  eventSubscriptions: {
    [key in EventType]: Subject<any>;
  } = this.resetSubscriptions();

  constructor() {}
  ngOnDestroy(): void {}

  resetSubscriptions() {
    this.eventSubscriptions = {
      [EventType.StartFullDownload]: new Subject<any>(),
      [EventType.EndFullDownload]: new Subject<any>(),
      [EventType.InputsStoredToDb]: new Subject<any>(),
      [EventType.SwipeActivated]: new Subject<any>(),
      [EventType.SwipeDeActivated]: new Subject<any>(),
      [EventType.StartDownload]: new Subject<any>(),
      [EventType.EndDownload]: new Subject<any>(),
      [EventType.SwipeVertical]: new Subject<any>(),
    };
    return this.eventSubscriptions;
  }

  async sendEvent(eventType: EventType) {
    console.log('Received event: ' + eventType);
    this.eventSubscriptions[eventType].next(eventType);
  }

  async sendEventWithData(eventType: EventType, eventData: any) {
    console.log('Received event: ' + eventType);
    this.eventSubscriptions[eventType].next(eventData);
  }

  async subscribeToEvent(
    eventType: EventType,
    callback: (...args: any[]) => void,
  ) {
    this.eventSubscriptions[eventType].subscribe((...eventData) => {
      callback(...eventData);
    });
  }

  async unSubscribeAll(events: EventType[]) {
    for (const eventType of events) {
      console.log('Unsubscribing all from ' + eventType);
      this.eventSubscriptions[eventType].unsubscribe();
      this.eventSubscriptions[eventType] = new Subject<any>();
    }
  }
}
