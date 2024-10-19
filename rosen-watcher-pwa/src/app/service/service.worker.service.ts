import { Injectable } from '@angular/core';
import { EventData, EventService, EventType } from './event.service';


// Define a type for the messages being sent to the service worker
interface ServiceWorkerMessage {
  type: string;
  data?: object;
  payload?: object;
}

export function initializeServiceWorkerService(serviceWorkerService: ServiceWorkerService) {
  return (): Promise<void> => {
    return serviceWorkerService.initialize();
  };
}

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {


  constructor(private eventService: EventService) {
    this.listenForServiceWorkerMessages();
  }

  public async initialize() {
    this.eventService.subscribeToAllEvents((eventType) => {
      this.sendMessageToServiceWorker({ type: eventType } as ServiceWorkerMessage);
    });

   
    
  }

  getVersion(): string | null{
    var version = localStorage.getItem("rosenWatcherServiceVersion");
    return version;
  }

  sendMessageToServiceWorker(message: ServiceWorkerMessage) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    } else {
      console.error('No active service worker found to send message');
    }
  }

  listenForServiceWorkerMessages() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const message = event.data as ServiceWorkerMessage;

        this.handleServiceWorkerMessage(message);

        var v = event?.data?.version?.appData?.version;

        if(v){
          this.eventService.sendEventWithData(EventType.VersionUpdated, v);
          localStorage.setItem("rosenWatcherServiceVersion", v);
        }

      });
    } else {
      console.error('Service worker is not supported in this browser.');
    }
  }

  handleServiceWorkerMessage(message: ServiceWorkerMessage) {
    console.log('Handling message from service worker:', message);

    if ((Object.values(EventType) as string[]).includes(message.type)) {
      if (message.data) {
        this.eventService.sendEventWithData(message.type as EventType, message.data as EventData);
      } else {
        this.eventService.sendEvent(message.type as EventType);
      }
    }
  }
}
