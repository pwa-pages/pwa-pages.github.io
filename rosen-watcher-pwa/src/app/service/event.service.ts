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
export class EventService<T> {
  eventSubscriptions: {
    [key in EventType]: Subject<T>;
  } = this.resetSubscriptions();

  resetSubscriptions() {
    this.eventSubscriptions = {
      [EventType.StartFullDownload]: new Subject<T>(),
      [EventType.EndFullDownload]: new Subject<T>(),
      [EventType.InputsStoredToDb]: new Subject<T>(),
      [EventType.SwipeActivated]: new Subject<T>(),
      [EventType.SwipeDeActivated]: new Subject<T>(),
      [EventType.StartDownload]: new Subject<T>(),
      [EventType.EndDownload]: new Subject<T>(),
      [EventType.SwipeVertical]: new Subject<T>(),
    };
    return this.eventSubscriptions;
  }

  async sendEvent(eventType: EventType) {
    console.log('Received event: ' + eventType);
    this.eventSubscriptions[eventType].next({} as T);
  }

  async sendEventWithData(eventType: EventType, eventData: T) {
    console.log('Received event: ' + eventType);
    this.eventSubscriptions[eventType].next(eventData);
  }

  async subscribeToEvent(eventType: EventType, callback: (...args: T[]) => void) {
    this.eventSubscriptions[eventType].subscribe((...eventData) => {
      callback(...eventData);
    });
  }

  async subscribeToAllEvents(callback: (eventType: EventType, ...args: T[]) => void) {
    Object.values(EventType).forEach((eventType) => {
      this.subscribeToEvent(eventType, (...args: T[]) => callback(eventType, ...args));
    });
  }

  async unSubscribeAll(events: EventType[]) {
    for (const eventType of events) {
      console.log('Unsubscribing all from ' + eventType);
      this.eventSubscriptions[eventType].unsubscribe();
      this.eventSubscriptions[eventType] = new Subject<T>();
    }
  }
}
