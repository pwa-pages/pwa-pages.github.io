// No triple-slash directives or 'declare const self'
self.addEventListener('message', async (event) => {
    const processEventServiceSingleton = (() => {
        console.log('Initializing ProcessEventService singleton');
        let instance = null;
        return () => {
            if (!instance) {
                instance = new ProcessEventService(new ServiceWorkerEventSender());
            }
            return instance;
        };
    })();
    const processEventService = processEventServiceSingleton();
    const data = event.data;
    console.log(`Rosen service worker received event of type ${data.type}`);
    processEventService.processEvent({ metaData: data.data, type: data.type });
});
