import { Injectable } from '@angular/core';
import { EventData, EventService, EventType } from './event.service';

// Define a type for the messages being sent to the service worker
interface ServiceWorkerMessage {
  type: string;
  data?: object;
  profile: string | undefined | null;
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
  private currentProfile: string | null | undefined = null;

  constructor(private eventService: EventService) {
    this.listenForServiceWorkerMessages();
  }

  public async initialize() {
    this.eventService.subscribeToAllEvents((eventType, eventData) => {
      if (
        eventType == EventType.PerformanceScreenLoaded ||
        eventType == EventType.StatisticsScreenLoaded ||
        eventType == EventType.RequestInputsDownload
      ) {
        this.sendMessageToServiceWorker({
          type: eventType,
          data: eventData,
        } as ServiceWorkerMessage);
      }
    });
  }

  getVersion(): string | null {
    const version = localStorage.getItem('rosenWatcherServiceVersion');
    return version;
  }

  sendMessageToServiceWorker(message: ServiceWorkerMessage) {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          this.currentProfile = message.data as string | null | undefined;
          registration.active.postMessage(message);
        } else {
          console.error('Service worker is not active yet');
        }
      }).catch((error) => {
        console.error('Error waiting for service worker to become ready:', error);
      });
    } else {
      console.error('No service worker found');
    }
  }

  listenForServiceWorkerMessages() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker has taken control. Reloading the page.');
        //window.location.reload();
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        const message = event.data as ServiceWorkerMessage;

        console.log(
          'Received message from service worker of type ' +
            message.type +
            ', profile ' +
            message.profile,
        );

        this.handleServiceWorkerMessage(message);

        const v = event?.data?.version?.appData?.version;

        if (v) {
          this.eventService.sendEventWithData(EventType.VersionUpdated, v, null);
          localStorage.setItem('rosenWatcherServiceVersion', v);
        }
      });
    } else {
      console.error('Service worker is not supported in this browser.');
    }
  }

  handleServiceWorkerMessage(message: ServiceWorkerMessage) {
    console.log('Handling message from service worker:', message);

    let process = !message.profile && !this.currentProfile;

    if (message.profile || this.currentProfile) {
      process = process || message.profile == this.currentProfile;
    }

    if (process && (Object.values(EventType) as string[]).includes(message.type)) {
      if (message.data) {
        this.eventService.sendEventWithData(
          message.type as EventType,
          message.data as EventData,
          message.profile,
        );
      } else {
        this.eventService.sendEvent(message.type as EventType);
      }
    }
  }
}
