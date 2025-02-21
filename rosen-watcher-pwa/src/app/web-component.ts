import { createCustomElement } from '@angular/elements';
import { bootstrapApplication } from '@angular/platform-browser';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { WatchersComponent } from './statistics/watchers.component';
import 'zone.js';


bootstrapApplication(WatchersComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
}).then((appRef) => {
  const element = createCustomElement(WatchersComponent, { injector: appRef.injector });
  customElements.define('app-watchers', element as CustomElementConstructor);
});
