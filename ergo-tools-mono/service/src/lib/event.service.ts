import {
  Injectable,
  Input,
  NgZone,
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { EventType } from './models';


export type EventData = string | Input | object;

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(
    private ngZone: NgZone | null = null,
  ) {
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
      [EventType.ChainPerfChartChanged]: new Subject<EventData>(),
      [EventType.ReportsRequested]: new Subject<EventData>(),
      [EventType.SwipeActivated]: new Subject<EventData>(),
      [EventType.SwipeDeActivated]: new Subject<EventData>(),
      [EventType.SwipeVertical]: new Subject<EventData>(),
      [EventType.StatisticsRequested]: new Subject<EventData>(),
      [EventType.MyWatcherStatsRequested]: new Subject<EventData>(),
      [EventType.PermitsChanged]: new Subject<EventData>(),
      [EventType.ChainPerformanceRequested]: new Subject<EventData>(),
      [EventType.RequestInputsDownload]: new Subject<EventData>(),
      [EventType.AddressChartChanged]: new Subject<EventData>(),
      [EventType.VersionUpdated]: new Subject<EventData>(),
      [EventType.WatcherStatsRequested]: new Subject<EventData>(),
      [EventType.SettingsScreenLoaded]: new Subject<EventData>(),
      [EventType.WindowResized]: new Subject<EventData>(),
      [EventType.WatchersStatsChanged]: new Subject<EventData>(),
      [EventType.PermitsStatsChanged]: new Subject<EventData>(),
      [EventType.ReportsChanged]: new Subject<EventData>(),
      [EventType.ChainPerformanceChartsChanged]:
        new Subject<EventData>(),
      [EventType.PerformanceChartsChanged]:
        new Subject<EventData>(),
      [EventType.StatisticsChartChanged]:
        new Subject<EventData>(),
      [EventType.RefreshPermits]: new Subject<EventData>(),
      [EventType.AddressPermitsDownloaded]:
        new Subject<EventData>(),
      [EventType.MyWatcherStatsRequestFinished]: new Subject<EventData>(),
      [EventType.ALLReportsDataAvailable]: new Subject<EventData>()
    };

    return this.eventSubscriptions;
  }

  async sendEvent(eventType: EventType) {
    console.log('Received event: ' + eventType);

    this.eventSubscriptions[eventType].next(
      {} as EventData,
    );
  }

  async sendEventWithData(
    eventType: EventType,
    eventData: EventData,
  ) {
    this.eventSubscriptions[eventType].next(
      eventData,
    );
  }

  observeEvent<T>(eventType: EventType): Observable<T> {
    return this.eventSubscriptions[eventType].asObservable() as Observable<T>;
  }

  async subscribeToEvent<T>(
    eventType: EventType,
    callback: (...args: T[]) => void | Promise<void>,
    id = -1,
  ) {
    const eventCallback = callback as (
      ...args: EventData[]
    ) => void | Promise<void>;

    this.subscribe(
      eventType,
      eventCallback,
      id,
    );
  }

  private subscribe(
    eventType: EventType,
    callback: (
      ...args: EventData[]
    ) => void | Promise<void>,
    id: number,
  ) {
    console.log(
      `Subscribing to event: ${eventType} with id: ${id}`,
    );

    const subscription =
      this.eventSubscriptions[eventType]
        .asObservable()
        .subscribe(async (...eventData) => {
          if (this.ngZone) {
            await this.ngZone.run(() =>
              callback(...eventData),
            );
          } else {
            await callback(...eventData);
          }


        });

    if (!this.eventSubscriptionsById[id]) {
      this.eventSubscriptionsById[id] = [];
    }

    this.eventSubscriptionsById[id].push(
      subscription,
    );
  }



  async subscribeToAllEvents(
    callback: (
      eventType: EventType,
      ...args: EventData[]
    ) => void | Promise<void>,
    id = -1,
  ) {
    Object.values(EventType).forEach(
      (eventType) => {
        this.subscribeToEvent(
          eventType,
          (...args: EventData[]) =>
            callback(
              eventType,
              ...args,
            ),
          id,
        );
      },
    );
  }

  async unSubscribe(id: number) {
    if (this.eventSubscriptionsById[id]) {
      this.eventSubscriptionsById[id].forEach(
        (subscription) =>
          subscription.unsubscribe(),
      );

      delete this.eventSubscriptionsById[id];
    }

    Object.entries(
      this.eventSubscriptionsById,
    ).forEach(([key, subs]) => {
      console.log(
        `eventSubscriptionsById[${key}] size: ${subs.length}`,
      );
    });
  }
}