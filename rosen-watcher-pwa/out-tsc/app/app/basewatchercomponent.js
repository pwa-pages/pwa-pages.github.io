import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { EventType } from './service/event.service';
let BaseWatcherComponent = class BaseWatcherComponent {
    constructor(eventService, swipeService) {
        this.eventService = eventService;
        this.swipeService = swipeService;
        this.busyCounter = 1;
        this.loaderLogs = [];
        this.leftAction = '';
        this.rightAction = '';
    }
    resetHeight() {
        document.body.style.height = window.innerHeight + 'px';
        document.documentElement.style.height = window.innerHeight + 'px';
    }
    initSwipe(left, right) {
        this.leftAction = left;
        this.rightAction = right;
        this.swipeService.swipeDetect(left, right);
    }
    swipeRight() {
        this.swipeService.swipe('right', this.rightAction);
    }
    swipeLeft() {
        this.swipeService.swipe('left', this.leftAction);
    }
    async ngOnInit() {
        this.eventService.sendEvent(EventType.SwipeActivated);
        await this.subscribeToEvent(EventType.StartFullDownload, () => {
            this.busyCounter = 1;
        });
        await this.subscribeToEvent(EventType.EndFullDownload, () => {
            this.busyCounter = 0;
        });
        window.addEventListener('resize', this.resetHeight);
        this.resetHeight();
    }
    async ngOnDestroy() {
        this.eventService.sendEvent(EventType.SwipeDeActivated);
        await this.eventService.unSubscribeAll([
            EventType.EndFullDownload,
            EventType.StartFullDownload,
            EventType.InputsStoredToDb,
        ]);
    }
    async subscribeToEvent(eventType, callback) {
        await this.eventService.subscribeToEvent(eventType, callback);
    }
    async subscribeToEvents(eventTypes, callback) {
        eventTypes.forEach(async (eventType) => {
            await this.eventService.subscribeToEvent(eventType, callback);
        });
    }
};
BaseWatcherComponent = __decorate([
    Component({
        selector: 'app-root',
        template: '',
    })
], BaseWatcherComponent);
export { BaseWatcherComponent };
//# sourceMappingURL=basewatchercomponent.js.map