"use strict";
// Define the singleton at module scope
const processEventServiceSingleton = (() => {
    console.log('Initializing ProcessEventService singleton factory');
    let instance = null;
    return () => {
        if (!instance) {
            console.log('Creating new ProcessEventService instance');
            instance = new ProcessEventService(new ServiceWorkerEventSender());
        }
        return instance;
    };
})();
self.addEventListener('message', async (event) => {
    const processEventService = processEventServiceSingleton();
    const data = event.data;
    console.log(`Rosen service worker received event of type ${data.type}`);
    processEventService.processEvent({
        data: data.data,
        type: data.type,
    });
});
//# sourceMappingURL=rosen-download-worker.js.map