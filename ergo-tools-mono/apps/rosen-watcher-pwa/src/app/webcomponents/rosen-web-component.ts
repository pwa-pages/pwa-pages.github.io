import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { RosenWatcherComponent } from '../elements/rosen.watcher.component';
import {
  initializeDataService,
  ChainDataService,
} from '../service/chain.data.service';
import {
  initializeServiceWorkerService,
  ServiceWorkerService,
} from '../service/service.worker.service';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import 'zone.js';

const dataServiceInitializer = {
  provide: APP_INITIALIZER,
  useFactory: initializeDataService,
  deps: [ChainDataService],
  multi: true,
};

const serviceWorkerInitializer = {
  provide: APP_INITIALIZER,
  useFactory: initializeServiceWorkerService,
  deps: [ServiceWorkerService],
  multi: true,
};

(async () => {
  const app = await createApplication({
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      dataServiceInitializer,
      serviceWorkerInitializer,
      { provide: IS_ELEMENTS_ACTIVE, useValue: true },
    ],
  });

  const element = createCustomElement(RosenWatcherComponent, {
    injector: app.injector,
  });

  if (!customElements.get('rosen-watcher-component')) {
    customElements.define('rosen-watcher-component', element);
  }
})();
