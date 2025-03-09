import { createCustomElement } from '@angular/elements';
import { bootstrapApplication } from '@angular/platform-browser';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { WatchersComponent } from './statistics/watchers.component';
import 'zone.js';
import { ChainPerformanceComponent } from './statistics/chain.performance.component';

bootstrapApplication(WatchersComponent, {
  providers: [provideHttpClient(withInterceptorsFromDi())],
}).then((appRef) => {
  let element = createCustomElement(WatchersComponent, { injector: appRef.injector });
  customElements.define('app-watchers', element as CustomElementConstructor);
  element = createCustomElement(ChainPerformanceComponent, { injector: appRef.injector });
  customElements.define('app-chain-performance', element as CustomElementConstructor);
});
