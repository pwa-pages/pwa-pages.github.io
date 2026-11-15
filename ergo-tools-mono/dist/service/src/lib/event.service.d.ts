import { Input, NgZone } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { EventType } from './models';
export type EventData = string | Input | object;
export declare class EventService {
    private ngZone;
    constructor(ngZone?: NgZone | null);
    eventSubscriptions: Record<EventType, Subject<EventData>>;
    eventSubscriptionsById: Record<number, Subscription[]>;
    resetSubscriptions(): Record<EventType, Subject<EventData>>;
    sendEvent(eventType: EventType): Promise<void>;
    sendEventWithData(eventType: EventType, eventData: EventData): Promise<void>;
    observeEvent<T>(eventType: EventType): Observable<T>;
    subscribeToEvent<T>(eventType: EventType, callback: (...args: T[]) => void | Promise<void>, id?: number): Promise<void>;
    private subscribe;
    subscribeToAllEvents(callback: (eventType: EventType, ...args: EventData[]) => void | Promise<void>, id?: number): Promise<void>;
    unSubscribe(id: number): Promise<void>;
}
