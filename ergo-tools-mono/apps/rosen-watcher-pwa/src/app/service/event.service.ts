import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Input } from '../../service/ts/models/input';
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
  StatisticsScreenLoaded = 'StatisticsScreenLoaded',
  MyWatchersScreenLoaded = 'MyWatchersScreenLoaded',
  RequestInputsDownload = 'RequestInputsDownload',
  WatchersScreenLoaded = 'WatchersScreenLoaded',
  SettingsScreenLoaded = 'SettingsScreenLoaded',
  PerformanceScreenLoaded = 'PerformanceScreenLoaded',
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

export type EventData = string | Input | object;

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
      [EventType.StatisticsScreenLoaded]: new Subject<EventData>(),
      [EventType.MyWatchersScreenLoaded]: new Subject<EventData>(),
      [EventType.PermitsChanged]: new Subject<EventData>(),
      [EventType.PerformanceScreenLoaded]: new Subject<EventData>(),
      [EventType.RequestInputsDownload]: new Subject<EventData>(),
      [EventType.AddressChartChanged]: new Subject<EventData>(),
      [EventType.VersionUpdated]: new Subject<EventData>(),
      [EventType.WatchersScreenLoaded]: new Subject<EventData>(),
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
