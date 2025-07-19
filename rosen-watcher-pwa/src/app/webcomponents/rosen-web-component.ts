import { createCustomElement } from '@angular/elements';
import { bootstrapApplication } from '@angular/platform-browser';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import 'zone.js';
import { APP_INITIALIZER } from '@angular/core';
import { initializeDataService, DataService } from '../service/data.service';
import {
  initializeServiceWorkerService,
  ServiceWorkerService,
} from '../service/service.worker.service';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { RosenComponent } from '../statistics/rosen.component';

export const dataServiceInitializer = {
  provide: APP_INITIALIZER,
  useFactory: initializeDataService,
  deps: [DataService],
  multi: true,
};

export const serviceWorkerInitializer = {
  provide: APP_INITIALIZER,
  useFactory: initializeServiceWorkerService,
  deps: [ServiceWorkerService],
  multi: true,
};

bootstrapApplication(RosenComponent, {
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
  const element = createCustomElement(RosenComponent, {
    injector: appRef.injector,
  });
  customElements.define('app-rosen-component', element as CustomElementConstructor);
});
