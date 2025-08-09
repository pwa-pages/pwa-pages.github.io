import { createCustomElement } from '@angular/elements';
import { bootstrapApplication } from '@angular/platform-browser';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import 'zone.js';
import { APP_INITIALIZER } from '@angular/core';
import { initializeDataService, ChainDataService } from '../service/chain.data.service';
import {
  initializeServiceWorkerService,
  ServiceWorkerService,
} from '../service/service.worker.service';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { RosenWatcherComponent } from '../elements/rosen.watcher.component';

export const dataServiceInitializer = {
  provide: APP_INITIALIZER,
  useFactory: initializeDataService,
  deps: [ChainDataService],
  multi: true,
};

export const serviceWorkerInitializer = {
  provide: APP_INITIALIZER,
  useFactory: initializeServiceWorkerService,
  deps: [ServiceWorkerService],
  multi: true,
};

bootstrapApplication(RosenWatcherComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    dataServiceInitializer,
    serviceWorkerInitializer,
    {
      provide: IS_ELEMENTS_ACTIVE,
      useValue: true,
    },
  ],
}).then((appRef) => {
  const element = createCustomElement(RosenWatcherComponent, {
    injector: appRef.injector,
  });
  customElements.define('rosen-watcher-component', element as CustomElementConstructor);
});
