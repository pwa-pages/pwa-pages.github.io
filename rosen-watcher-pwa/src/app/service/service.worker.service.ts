import { Injectable } from '@angular/core';
import { EventService, EventType } from './event.service';

// Define a type for the messages being sent to the service worker
interface ServiceWorkerMessage {
  type: string;
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
  constructor(
    private eventService: EventService<string>
  ) {
    this.listenForServiceWorkerMessages(); 
  }

  public async initialize() {
    this.eventService.subscribeToAllEvents((eventType) => {
      this.sendMessageToServiceWorker({ type: eventType } as ServiceWorkerMessage);
    });
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
      });
    } else {
      console.error('Service worker is not supported in this browser.');
    }
  }


  handleServiceWorkerMessage(message: ServiceWorkerMessage) {

    console.log('Handling message from service worker:', message);
    
    if ((Object.values(EventType) as string[]).includes(message.type)) {
      this.eventService.sendEvent(message.type as EventType);
    }
  }
}
