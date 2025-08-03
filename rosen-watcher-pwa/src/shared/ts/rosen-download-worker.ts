// No triple-slash directives or 'declare const self'

// Define interfaces for the data structures used
interface MessageEventData {
  type: string;
  data: string;
}

// Service Worker Event Listener
self.addEventListener('message', async (event: MessageEvent) => {
  const processEventService = new ProcessEventService(new ServiceWorkerEventSender());
  const data: MessageEventData = event.data;

  console.log(`Rosen service worker received event of type ${data.type}`);
  processEventService.processEvent({ metaData: data.data, type: data.type });
});
