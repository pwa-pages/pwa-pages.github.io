import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgZone } from '@angular/core';

export enum EventType {
  StartFullDownload = 'StartFullDownload',
  EndFullDownload = 'EndFullDownload',
  RefreshInputs = 'RefreshInputs',
  InputsChanged = 'InputsChanged',
  PerfChartChanged = 'PerfChartChanged',
  SwipeActivated = 'SwipeActivated',
  SwipeDeActivated = 'SwipeDeActivated',
  SwipeVertical = 'SwipeVertical',
  MainScreenLoaded = 'MainScreenLoaded',
  MyAntichessScreenLoaded = 'MyAntichessScreenLoaded',
  RequestInputsDownload = 'RequestInputsDownload',
  AntichessScreenLoaded = 'AntichessScreenLoaded',
  SettingsScreenLoaded = 'SettingsScreenLoaded',
  EventsScreenLoaded = 'EventsScreenLoaded',
  AddressChartChanged = 'AddressChartChanged',
  WindowResized = 'WindowResized',
  VersionUpdated = 'VersionUpdated',
  WatchersStatsChanged = 'WatchersStatsChanged',
  PermitsStatsChanged = 'PermitsStatsChanged',
  ChainPerformanceChartsChanged = 'ChainPerformanceChartsChanged',
  PerformanceChartsChanged = 'PerformanceChartsChanged',
  StatisticsChartChanged = 'StatisticsChartChanged',
  PermitsChanged = 'PermitsChanged',
  RefreshPermits = 'RefreshPermits',
  AddressPermitsDownloaded = 'AddressPermitsDownloaded',
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
      [EventType.RefreshInputs]: new Subject<EventData>(),
      [EventType.InputsChanged]: new Subject<EventData>(),
      [EventType.PerfChartChanged]: new Subject<EventData>(),
      [EventType.SwipeActivated]: new Subject<EventData>(),
      [EventType.SwipeDeActivated]: new Subject<EventData>(),
      [EventType.SwipeVertical]: new Subject<EventData>(),
      [EventType.MainScreenLoaded]: new Subject<EventData>(),
      [EventType.MyAntichessScreenLoaded]: new Subject<EventData>(),
      [EventType.PermitsChanged]: new Subject<EventData>(),
      [EventType.EventsScreenLoaded]: new Subject<EventData>(),
      [EventType.RequestInputsDownload]: new Subject<EventData>(),
      [EventType.AddressChartChanged]: new Subject<EventData>(),
      [EventType.VersionUpdated]: new Subject<EventData>(),
      [EventType.AntichessScreenLoaded]: new Subject<EventData>(),
      [EventType.SettingsScreenLoaded]: new Subject<EventData>(),
      [EventType.WindowResized]: new Subject<EventData>(),
      [EventType.WatchersStatsChanged]: new Subject<EventData>(),
      [EventType.PermitsStatsChanged]: new Subject<EventData>(),
      [EventType.ChainPerformanceChartsChanged]: new Subject<EventData>(),
      [EventType.PerformanceChartsChanged]: new Subject<EventData>(),
      [EventType.StatisticsChartChanged]: new Subject<EventData>(),
      [EventType.RefreshPermits]: new Subject<EventData>(),
      [EventType.AddressPermitsDownloaded]: new Subject<EventData>(),
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
