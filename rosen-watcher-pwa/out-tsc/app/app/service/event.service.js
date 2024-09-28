import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
export var EventType;
(function (EventType) {
    EventType["StartFullDownload"] = "StartFullDownload";
    EventType["EndFullDownload"] = "EndFullDownload";
    EventType["InputsStoredToDb"] = "InputsStoredToDb";
    EventType["SwipeActivated"] = "SwipeActivated";
    EventType["SwipeDeActivated"] = "SwipeDeActivated";
    EventType["StartDownload"] = "StartDownload";
    EventType["EndDownload"] = "EndDownload";
    EventType["SwipeVertical"] = "SwipeVertical";
    EventType["StatisticsScreenLoaded"] = "StatisticsScreenLoaded";
})(EventType || (EventType = {}));
let EventService = class EventService {
    constructor() {
        this.eventSubscriptions = this.resetSubscriptions();
    }
    resetSubscriptions() {
        this.eventSubscriptions = {
            [EventType.StartFullDownload]: new Subject(),
            [EventType.EndFullDownload]: new Subject(),
            [EventType.InputsStoredToDb]: new Subject(),
            [EventType.SwipeActivated]: new Subject(),
            [EventType.SwipeDeActivated]: new Subject(),
            [EventType.StartDownload]: new Subject(),
            [EventType.EndDownload]: new Subject(),
            [EventType.SwipeVertical]: new Subject(),
            [EventType.StatisticsScreenLoaded]: new Subject(),
        };
        return this.eventSubscriptions;
    }
    async sendEvent(eventType) {
        console.log('Received event: ' + eventType);
        this.eventSubscriptions[eventType].next({});
    }
    async sendEventWithData(eventType, eventData) {
        console.log('Received event: ' + eventType);
        this.eventSubscriptions[eventType].next(eventData);
    }
    async subscribeToEvent(eventType, callback) {
        this.eventSubscriptions[eventType].subscribe((...eventData) => {
            callback(...eventData);
        });
    }
    async subscribeToAllEvents(callback) {
        Object.values(EventType).forEach((eventType) => {
            this.subscribeToEvent(eventType, (...args) => callback(eventType, ...args));
        });
    }
    async unSubscribeAll(events) {
        for (const eventType of events) {
            console.log('Unsubscribing all from ' + eventType);
            this.eventSubscriptions[eventType].unsubscribe();
            this.eventSubscriptions[eventType] = new Subject();
        }
    }
};
EventService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], EventService);
export { EventService };
//# sourceMappingURL=event.service.js.map