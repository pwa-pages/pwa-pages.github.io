import { createCustomElement } from "@angular/elements";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import "zone.js";
import { ChainPerformanceComponent } from "../statistics/chain.performance.component";

bootstrapApplication(ChainPerformanceComponent, {
  providers: [provideHttpClient(withInterceptorsFromDi())],
}).then((appRef) => {
  const element = createCustomElement(ChainPerformanceComponent, {
    injector: appRef.injector,
  });
  customElements.define(
    "app-chain-performance",
    element as CustomElementConstructor,
  );
});
