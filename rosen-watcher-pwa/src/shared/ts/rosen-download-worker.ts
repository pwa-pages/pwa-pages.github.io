// No triple-slash directives or 'declare const self'

interface MessageEventData {
  type: string;
  data: string;
}

self.addEventListener('message', async (event: MessageEvent) => {
  const processEventServiceSingleton = (() => {
    console.log('Initializing ProcessEventService singleton');
    let instance: ProcessEventService | null = null;
    return () => {
      if (!instance) {
        instance = new ProcessEventService(new ServiceWorkerEventSender());
      }
      return instance;
    };
  })();

  const processEventService = processEventServiceSingleton();
  const data: MessageEventData = event.data;

  console.log(`Rosen service worker received event of type ${data.type}`);
  processEventService.processEvent({ data: data.data as unknown as object, type: data.type });
});
