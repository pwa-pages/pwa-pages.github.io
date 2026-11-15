"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const core_1 = require("@angular/core");
const rxjs_1 = require("rxjs");
const models_1 = require("./models");
@(0, core_1.Injectable)({
    providedIn: 'root',
})
class EventService {
    ngZone;
    constructor(ngZone = null) {
        this.ngZone = ngZone;
        console.log('EventService initialized');
    }
    eventSubscriptions = this.resetSubscriptions();
    eventSubscriptionsById = {};
    resetSubscriptions() {
        this.eventSubscriptions = {
            [models_1.EventType.StartFullDownload]: new rxjs_1.Subject(),
            [models_1.EventType.EndFullDownload]: new rxjs_1.Subject(),
            [models_1.EventType.RefreshInputs]: new rxjs_1.Subject(),
            [models_1.EventType.InputsChanged]: new rxjs_1.Subject(),
            [models_1.EventType.PerfChartChanged]: new rxjs_1.Subject(),
            [models_1.EventType.ReportsRequested]: new rxjs_1.Subject(),
            [models_1.EventType.SwipeActivated]: new rxjs_1.Subject(),
            [models_1.EventType.SwipeDeActivated]: new rxjs_1.Subject(),
            [models_1.EventType.SwipeVertical]: new rxjs_1.Subject(),
            [models_1.EventType.StatisticsScreenLoaded]: new rxjs_1.Subject(),
            [models_1.EventType.MyWatcherStatsRequested]: new rxjs_1.Subject(),
            [models_1.EventType.PermitsChanged]: new rxjs_1.Subject(),
            [models_1.EventType.PerformanceScreenLoaded]: new rxjs_1.Subject(),
            [models_1.EventType.RequestInputsDownload]: new rxjs_1.Subject(),
            [models_1.EventType.AddressChartChanged]: new rxjs_1.Subject(),
            [models_1.EventType.VersionUpdated]: new rxjs_1.Subject(),
            [models_1.EventType.WatcherStatsRequested]: new rxjs_1.Subject(),
            [models_1.EventType.SettingsScreenLoaded]: new rxjs_1.Subject(),
            [models_1.EventType.WindowResized]: new rxjs_1.Subject(),
            [models_1.EventType.WatchersStatsChanged]: new rxjs_1.Subject(),
            [models_1.EventType.PermitsStatsChanged]: new rxjs_1.Subject(),
            [models_1.EventType.ReportsChanged]: new rxjs_1.Subject(),
            [models_1.EventType.ChainPerformanceChartsChanged]: new rxjs_1.Subject(),
            [models_1.EventType.PerformanceChartsChanged]: new rxjs_1.Subject(),
            [models_1.EventType.StatisticsChartChanged]: new rxjs_1.Subject(),
            [models_1.EventType.RefreshPermits]: new rxjs_1.Subject(),
            [models_1.EventType.AddressPermitsDownloaded]: new rxjs_1.Subject(),
        };
        return this.eventSubscriptions;
    }
    async sendEvent(eventType) {
        console.log('Received event: ' + eventType);
        this.eventSubscriptions[eventType].next({});
    }
    async sendEventWithData(eventType, eventData) {
        this.eventSubscriptions[eventType].next(eventData);
    }
    observeEvent(eventType) {
        return this.eventSubscriptions[eventType].asObservable();
    }
    async subscribeToEvent(eventType, callback, id = -1) {
        const eventCallback = callback;
        this.subscribe(eventType, eventCallback, id);
    }
    subscribe(eventType, callback, id) {
        console.log(`Subscribing to event: ${eventType} with id: ${id}`);
        const subscription = this.eventSubscriptions[eventType]
            .asObservable()
            .subscribe(async (...eventData) => {
            if (this.ngZone) {
                await this.ngZone.run(() => callback(...eventData));
            }
            else {
                await callback(...eventData);
            }
        });
        if (!this.eventSubscriptionsById[id]) {
            this.eventSubscriptionsById[id] = [];
        }
        this.eventSubscriptionsById[id].push(subscription);
    }
    async subscribeToAllEvents(callback, id = -1) {
        Object.values(models_1.EventType).forEach((eventType) => {
            this.subscribeToEvent(eventType, (...args) => callback(eventType, ...args), id);
        });
    }
    async unSubscribe(id) {
        if (this.eventSubscriptionsById[id]) {
            this.eventSubscriptionsById[id].forEach((subscription) => subscription.unsubscribe());
            delete this.eventSubscriptionsById[id];
        }
        Object.entries(this.eventSubscriptionsById).forEach(([key, subs]) => {
            console.log(`eventSubscriptionsById[${key}] size: ${subs.length}`);
        });
    }
}
exports.EventService = EventService;
