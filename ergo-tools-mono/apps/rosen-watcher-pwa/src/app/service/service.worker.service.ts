import { Inject, Injectable } from '@angular/core';
import { EventData, EventService, EventType } from './event.service';
import { HttpClient } from '@angular/common/http';
import { IS_ELEMENTS_ACTIVE } from './tokens';

// Define a type for the messages being sent to the service worker
interface ServiceWorkerMessage {
  type: string;
  data?: object;
  payload?: object;
}

class AngularEventSender implements EventSender {
  constructor(private eventService: EventService) {}

  async sendEvent<T>(event: EventPayload<T>): Promise<void> {
    this.eventService.sendEventWithData(
      event.type as EventType,
      event.data ?? '',
    );
  }
}

export function initializeServiceWorkerService(
  serviceWorkerService: ServiceWorkerService,
) {
  return (): Promise<void> => {
    return serviceWorkerService.initialize();
  };
}

@Injectable({
  providedIn: 'root',
})
export class ServiceWorkerService {
  private avoidServiceWorker = true;

  constructor(
    private eventService: EventService,
    private http: HttpClient,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    this.checkForVersionDiscrepancy();
    this.listenForServiceWorkerMessages();
  }

  public async initialize() {
    this.eventService.subscribeToAllEvents((eventType, eventData) => {
      if (
        eventType == EventType.PerformanceScreenLoaded ||
        eventType == EventType.MyWatchersScreenLoaded ||
        eventType == EventType.StatisticsScreenLoaded ||
        eventType == EventType.RequestInputsDownload
      ) {
        console.log(eventData);

        if (this.avoidServiceWorker) {
          console.log(
            'Avoiding service worker, sending event ' +
              eventType +
              'to angular worker',
          );
          const processEventService = new ProcessEventService(
            new AngularEventSender(this.eventService),
          );

          processEventService.processEvent({
            data: eventData as object | undefined,
            type: eventType,
          });
        } else {
          console.log('Sending to service worker, event ' + eventType);
          this.sendMessageToServiceWorker({
            type: eventType,
            data: eventData,
          } as ServiceWorkerMessage);
        }
      }
    });
  }

  checkForVersionDiscrepancy(): void {
    if (this.isElementsActive) {
      console.log('Elements are active, avoiding service worker');
      this.avoidServiceWorker = true;
      return;
    }

    this.http
      .get<{
        appData?: { version?: string };
      }>('ngsw.json', { responseType: 'json' })
      .subscribe(
        (data) => {
          console.log(
            'Current Service Worker Version(ngsw.json) :',
            data.appData?.version,
          );
          console.log(
            'localStorage rosenWatcherServiceVersion:',
            localStorage.getItem('rosenWatcherServiceVersion'),
          );

          if (
            data.appData?.version ==
            localStorage.getItem('rosenWatcherServiceVersion')
          ) {
            console.log('sw versions in sync');
            this.avoidServiceWorker = false;
          } else {
            console.log('sw versions not in sync');
            this.avoidServiceWorker = true;
          }
        },
        (error: unknown) => {
          console.error('Error fetching SW version', error);
        },
      );
  }

  getVersion(): string | null {
    const version = localStorage.getItem('rosenWatcherServiceVersion');
    return version;
  }

  sendMessageToServiceWorker(message: ServiceWorkerMessage) {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration.active) {
            registration.active.postMessage(message);
          } else {
            console.error('Service worker is not active yet');
          }
        })
        .catch((error) => {
          console.error(
            'Error waiting for service worker to become ready:',
            error,
          );
        });
    } else {
      console.error('No service worker found');
    }
  }

  listenForServiceWorkerMessages() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log(
          'New service worker has taken control. Reloading the page.',
        );
        //window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        if (registration.installing) {
          console.log('Service worker installing new version.');
        }
        registration.addEventListener('updatefound', () => {
          console.log('updatefound: Service worker installing new version.');
        });
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        const message = event.data as ServiceWorkerMessage;

        console.log(
          'Received message from service worker of type ' + message.type,
        );

        this.handleServiceWorkerMessage(message);

        const v = event?.data?.version?.appData?.version;

        if (v) {
          this.eventService.sendEventWithData(EventType.VersionUpdated, v);
          localStorage.setItem('rosenWatcherServiceVersion', v);
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
        this.eventService.sendEventWithData(
          message.type as EventType,
          message.data as EventData,
        );
      } else {
        this.eventService.sendEvent(message.type as EventType);
      }
    }
  }
}
