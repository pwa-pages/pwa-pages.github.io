import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Input } from '../../service/ts/models/input';

export enum EventType {
  StartFullDownload = 'StartFullDownload',
  EndFullDownload = 'EndFullDownload',
  RefreshInputs = 'RefreshInputs',
  InputsChanged = 'InputsChanged',
  SwipeActivated = 'SwipeActivated',
  SwipeDeActivated = 'SwipeDeActivated',
  SwipeVertical = 'SwipeVertical',
  StatisticsScreenLoaded = 'StatisticsScreenLoaded',
  RequestInputsDownload = 'RequestInputsDownload',
  WatchersScreenLoaded = 'WatchersScreenLoaded',
  SettingsScreenLoaded = 'SettingsScreenLoaded',
  PerformanceScreenLoaded = 'PerformanceScreenLoaded',
  AddressChartChanged = 'AddressChartChanged',
  VersionUpdated = 'VersionUpdated',
}

export type EventData = string | Input;

@Injectable({
  providedIn: 'root',
})
export class EventService {
  eventSubscriptions: Record<EventType, Subject<EventData>> = this.resetSubscriptions();

  resetSubscriptions() {
    this.eventSubscriptions = {
      [EventType.StartFullDownload]: new Subject<EventData>(),
      [EventType.EndFullDownload]: new Subject<EventData>(),
      [EventType.RefreshInputs]: new Subject<EventData>(),
      [EventType.InputsChanged]: new Subject<EventData>(),
      [EventType.SwipeActivated]: new Subject<EventData>(),
      [EventType.SwipeDeActivated]: new Subject<EventData>(),
      [EventType.SwipeVertical]: new Subject<EventData>(),
      [EventType.StatisticsScreenLoaded]: new Subject<EventData>(),
      [EventType.PerformanceScreenLoaded]: new Subject<EventData>(),
      [EventType.RequestInputsDownload]: new Subject<EventData>(),
      [EventType.AddressChartChanged]: new Subject<EventData>(),
      [EventType.VersionUpdated]: new Subject<EventData>(),
      [EventType.WatchersScreenLoaded]: new Subject<EventData>(),
      [EventType.SettingsScreenLoaded]: new Subject<EventData>(),
    };
    return this.eventSubscriptions;
  }

  async sendEvent(eventType: EventType) {
    console.log('Received event: ' + eventType);
    this.eventSubscriptions[eventType].next({} as EventData);
  }

  async sendEventWithData(
    eventType: EventType,
    eventData: EventData,
    profile?: string | undefined | null,
  ) {
    console.log('Received event: ' + eventType + ' for profile ' + profile);

    this.eventSubscriptions[eventType].next(eventData);
  }

  async subscribeToEvent<T>(eventType: EventType, callback: (...args: T[]) => void) {
    const eventCallBack: (...args: EventData[]) => void = callback as (
      ...args: EventData[]
    ) => void;
    await this.subscribe(eventType, eventCallBack);
  }

  private async subscribe(eventType: EventType, callback: (...args: EventData[]) => void) {
    this.eventSubscriptions[eventType].subscribe((...eventData) => {
      callback(...eventData);
    });
  }

  async subscribeToAllEvents(callback: (eventType: EventType, ...args: EventData[]) => void) {
    Object.values(EventType).forEach((eventType) => {
      this.subscribeToEvent(eventType, (...args: EventData[]) => callback(eventType, ...args));
    });
  }

  async unSubscribeAll(events: EventType[]) {
    for (const eventType of events) {
      console.log('Unsubscribing all from ' + eventType);
      this.eventSubscriptions[eventType].unsubscribe();
      this.eventSubscriptions[eventType] = new Subject<EventData>();
    }
  }
}
