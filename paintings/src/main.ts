import "@angular/compiler";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";

const routes: Routes = [
  { path: "image/:image", component: ImagesComponent },
  { path: "**", component: GalleryComponent },
];

// Import AppModule
import { AppComponent } from "./app/app.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { importProvidersFrom } from "@angular/core";
import { ServiceWorkerModule } from "@angular/service-worker";
import { provideAnimations } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
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
import { GalleryComponent } from "./app/images/gallery";
import { ImagesComponent } from "./app/images/images";

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
      ServiceWorkerModule.register("./" + getScriptFileName(), {
        registrationStrategy: "registerWhenStable:30000",
      }),
      FontAwesomeModule,
    ),
    DatePipe,
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimations(),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
});
