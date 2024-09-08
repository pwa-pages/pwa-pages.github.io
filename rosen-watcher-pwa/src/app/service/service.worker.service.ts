import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { EventService } from './event.service';

// Define a type for the messages being sent to the service worker
interface ServiceWorkerMessage {
  type: string;
  payload?: any;
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
  constructor(private swPush: SwPush, /*private swUpdate: SwUpdate, */private eventService: EventService<string>) {

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

  listenForPushNotifications() {
    
    this.swPush.messages.subscribe((msg) => {
      console.log('Received push notification message', msg);
    });
  }
}
