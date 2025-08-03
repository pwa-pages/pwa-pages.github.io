// No triple-slash directives or 'declare const self'
// Service Worker Event Listener
self.addEventListener('message', async (event) => {
    const processEventService = new ProcessEventService(new ServiceWorkerEventSender());
    const data = event.data;
    console.log(`Rosen service worker received event of type ${data.type}`);
    processEventService.processEvent({ metaData: data.data, type: data.type });
});
