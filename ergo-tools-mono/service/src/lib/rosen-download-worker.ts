
const processEventServiceSingleton = (() => {
  console.log('Initializing ProcessEventService singleton factory');

  let instance: ProcessEventService | null = null;

  return () => {
    if (!instance) {
      console.log('Creating new ProcessEventService instance');
      instance = new ProcessEventService(
        new ServiceWorkerEventSender()
      );
    }

    return instance;
  };
})();

// Detect execution environment
const isServiceWorker =
  typeof self !== 'undefined' &&
  'ServiceWorkerGlobalScope' in globalThis &&
  self instanceof (
    globalThis as typeof globalThis & {
      ServiceWorkerGlobalScope: new (...args: any[]) => object;
    }
  ).ServiceWorkerGlobalScope;

if (isServiceWorker) {
  console.log(
    '[Rosen Download] Running inside SERVICE WORKER'
  );

  self.addEventListener('message', (event: MessageEvent) => {
    const processEventService = processEventServiceSingleton();
    const data: MessageEventData = event.data;

    console.log(
      `[Rosen Download][SW] Received event: ${data.type}`
    );

    const extendableEvent = event as MessageEvent & {
      waitUntil(promise: Promise<unknown>): void;
    };

    extendableEvent.waitUntil(
      processEventService.processEvent({
        data: data.data as unknown as object,
        type: data.type,
      })
    );
  });
} else {
  console.log(
    '[Rosen Download] Running outside Service Worker (Angular/main thread or another context)'
  );
}
