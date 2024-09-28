import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { EventType } from './event.service';
export function initializeServiceWorkerService(serviceWorkerService) {
    return () => {
        return serviceWorkerService.initialize();
    };
}
let ServiceWorkerService = class ServiceWorkerService {
    constructor(eventService) {
        this.eventService = eventService;
        this.listenForServiceWorkerMessages();
    }
    async initialize() {
        this.eventService.subscribeToAllEvents((eventType) => {
            this.sendMessageToServiceWorker({ type: eventType });
        });
    }
    sendMessageToServiceWorker(message) {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(message);
        }
        else {
            console.error('No active service worker found to send message');
        }
    }
    listenForServiceWorkerMessages() {
        if (navigator.serviceWorker) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                const message = event.data;
                this.handleServiceWorkerMessage(message);
            });
        }
        else {
            console.error('Service worker is not supported in this browser.');
        }
    }
    handleServiceWorkerMessage(message) {
        console.log('Handling message from service worker:', message);
        if (Object.values(EventType).includes(message.type)) {
            this.eventService.sendEvent(message.type);
        }
    }
};
ServiceWorkerService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], ServiceWorkerService);
export { ServiceWorkerService };
//# sourceMappingURL=service.worker.service.js.map