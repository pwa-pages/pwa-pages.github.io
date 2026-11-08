"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
const process_event_service_1 = require("./process.event.service");
const processEventServiceSingleton = (() => {
    let instance = null;
    return () => {
        if (!instance) {
            console.log('Creating new ProcessEventService instance');
            instance = new process_event_service_1.ProcessEventService(new process_event_service_1.ServiceWorkerEventSender());
        }
        return instance;
    };
})();
// Detect execution environment
const isServiceWorker = typeof self !== 'undefined' &&
    'ServiceWorkerGlobalScope' in globalThis &&
    self instanceof globalThis.ServiceWorkerGlobalScope;
if (isServiceWorker) {
    console.log('[Rosen Download] Running inside SERVICE WORKER');
    self.addEventListener('message', (event) => {
        const processEventService = processEventServiceSingleton();
        const data = event.data;
        console.log(`[Rosen Download][SW] Received event: ${data.type}`);
        const extendableEvent = event;
        extendableEvent.waitUntil(processEventService.processEvent({
            data: data.data,
            type: models_1.EventType[data.type],
        }));
    });
}
else {
    console.log('[Rosen Download] Running outside Service Worker (Angular/main thread or another context)');
}
