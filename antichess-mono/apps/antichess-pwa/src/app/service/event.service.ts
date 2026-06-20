import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgZone } from '@angular/core';

export enum EventType {
  SwipeActivated = 'SwipeActivated',
  SwipeDeActivated = 'SwipeDeActivated',
  SwipeVertical = 'SwipeVertical',
  MainScreenLoaded = 'MainScreenLoaded',
  MyAntichessScreenLoaded = 'MyAntichessScreenLoaded',
  AntichessScreenLoaded = 'AntichessScreenLoaded',
  EventsScreenLoaded = 'EventsScreenLoaded',
  WindowResized = 'WindowResized',
  VersionUpdated = 'VersionUpdated',
  StartFullDownload = 'StartFullDownload',
  EndFullDownload = 'EndFullDownload',
  CloseChessBoard = 'CloseChessBoard',
}

export type EventData = string | object;

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private ngZone: NgZone) {
    console.log('EventService initialized');
  }

  eventSubscriptions: Record<EventType, Subject<EventData>> =
    this.resetSubscriptions();
  eventSubscriptionsById: Record<number, Subscription[]> = {};

  resetSubscriptions() {
    this.eventSubscriptions = {
      [EventType.StartFullDownload]: new Subject<EventData>(),
      [EventType.EndFullDownload]: new Subject<EventData>(),
      [EventType.SwipeActivated]: new Subject<EventData>(),
      [EventType.SwipeDeActivated]: new Subject<EventData>(),
      [EventType.SwipeVertical]: new Subject<EventData>(),
      [EventType.MainScreenLoaded]: new Subject<EventData>(),
      [EventType.MyAntichessScreenLoaded]: new Subject<EventData>(),
      [EventType.EventsScreenLoaded]: new Subject<EventData>(),
      [EventType.VersionUpdated]: new Subject<EventData>(),
      [EventType.AntichessScreenLoaded]: new Subject<EventData>(),
      [EventType.WindowResized]: new Subject<EventData>(),
      [EventType.CloseChessBoard]: new Subject<EventData>()
    };
    return this.eventSubscriptions;
  }

  async sendEvent(eventType: EventType) {
    console.log('Received event: ' + eventType);
    this.eventSubscriptions[eventType].next({} as EventData);
  }

  async sendEventWithData(eventType: EventType, eventData: EventData) {
    this.eventSubscriptions[eventType].next(eventData);
  }

  async subscribeToEvent<T>(
    eventType: EventType,
    callback: (...args: T[]) => void,
    id = -1,
  ) {
    const eventCallBack: (...args: EventData[]) => void = callback as (
      ...args: EventData[]
    ) => void;
    await this.subscribe(eventType, eventCallBack, id);
  }

  private async subscribe(
    eventType: EventType,
    callback: (...args: EventData[]) => void,
    id: number,
  ) {
    console.log(`Subscribing to event: ${eventType} with id: ${id}`);
    let subscription = this.eventSubscriptions[eventType]
      .asObservable()
      .subscribe((...eventData) => {
        this.ngZone.run(() => {
          callback(...eventData);
        });
      });

    if (!this.eventSubscriptionsById[id]) {
      this.eventSubscriptionsById[id] = [];
    }
    this.eventSubscriptionsById[id].push(subscription);
  }

  async subscribeToAllEvents(
    callback: (eventType: EventType, ...args: EventData[]) => void,
    id = -1,
  ) {
    Object.values(EventType).forEach((eventType) => {
      this.subscribeToEvent(
        eventType,
        (...args: EventData[]) => callback(eventType, ...args),
        id,
      );
    });
  }

  async unSubscribe(id: number) {
    if (this.eventSubscriptionsById[id]) {
      this.eventSubscriptionsById[id].forEach((subscription) =>
        subscription.unsubscribe(),
      );
      delete this.eventSubscriptionsById[id];
    }

    Object.entries(this.eventSubscriptionsById).forEach(([key, subs]) => {
      console.log(`eventSubscriptionsById[${key}] size: ${subs.length}`);
    });

    /*
    if (this.eventSubscriptionsById[-1]) {
      this.eventSubscriptionsById[-1].forEach((subscription) => subscription.unsubscribe());
      delete this.eventSubscriptionsById[-1];
    }
      */
  }
}
