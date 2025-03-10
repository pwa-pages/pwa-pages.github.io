import "@angular/compiler";

const routes: Routes = [
  { path: "settings", component: SettingsComponent },
  { path: "performance", component: PerformanceComponent },
  { path: "chainperformance", component: ChainPerformanceComponent },
  { path: "watchers", component: WatchersComponent },
  { path: "**", component: StatisticsComponent },
];

// Import AppModule
import { APP_INITIALIZER } from "@angular/core";
import { AppComponent } from "./app/app.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { importProvidersFrom } from "@angular/core";
import { ServiceWorkerModule } from "@angular/service-worker";
import { provideAnimations } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { StatisticsComponent } from "./app/statistics/statistics.component";
import { WatchersComponent } from "./app/statistics/watchers.component";
import { PerformanceComponent } from "./app/statistics/performance.component";
import { SettingsComponent } from "./app/settings//settings.component";
import { provideRouter, Routes } from "@angular/router";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import {
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { DatePipe, CommonModule } from "@angular/common";
import {
  initializeServiceWorkerService,
  ServiceWorkerService,
} from "./app/service/service.worker.service";
import { initializeDataService, DataService } from "./app/service/data.service";
import { ChainPerformanceComponent } from "./app/statistics/chain.performance.component";

function getScriptFileName(): string {
  const scripts = Array.from(document.querySelectorAll("script")); // Convert NodeList to an array
  for (const script of scripts) {
    if (script.src.includes("scripts-")) {
      const urlParts = script.src.split("/");
      return urlParts[urlParts.length - 1];
    }
  }
  return "scripts.js";
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      CommonModule,
      MatInputModule,
      MatFormFieldModule,
      MatDialogModule,
      FormsModule,
      //ServiceWorkerModule.register('./rosen-ngsw-worker.js', {
      ServiceWorkerModule.register("./" + getScriptFileName(), {
        registrationStrategy: "registerWhenStable:30000",
      }),
      FontAwesomeModule,
    ),
    DatePipe,
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeServiceWorkerService,
      deps: [ServiceWorkerService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDataService,
      deps: [DataService],
      multi: true,
    },
  ],
});
