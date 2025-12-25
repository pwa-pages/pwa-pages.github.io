

// Define the singleton at module scope
const processEventServiceSingleton = (() => {
  console.log('Initializing ProcessEventService singleton factory');
  let instance: ProcessEventService | null = null;
  return () => {
    if (!instance) {
      console.log('Creating new ProcessEventService instance');
      instance = new ProcessEventService(new ServiceWorkerEventSender());
    }
    return instance;
  };
})();

self.addEventListener('message', async (event: MessageEvent) => {
  const processEventService = processEventServiceSingleton();
  const data: MessageEventData = event.data;

  console.log(`Rosen service worker received event of type ${data.type}`);
  processEventService.processEvent({
    data: data.data as unknown as object,
    type: data.type,
  });
});
