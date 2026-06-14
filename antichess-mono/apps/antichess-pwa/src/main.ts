import '@angular/compiler';

const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'events', component: EventsComponent },
  { path: 'antichess', component: AntichessComponent },
  { path: 'antichessguide', component: AntichessGuideComponent },
  { path: 'antichesslinks', component: AntichessLinksComponent },
  { path: 'players', component: PlayersComponent },
  { path: 'rank', component: RankComponent },
  { path: 'titles', component: TitlesComponent },
    { path: '**', component: MainComponent },
];

// Import AppModule
import { APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app/app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { importProvidersFrom } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { provideRouter, Routes, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  withInterceptorsFromDi,
  provideHttpClient,
} from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { DatePipe, CommonModule } from '@angular/common';
import {
  initializeServiceWorkerService,
  ServiceWorkerService,
} from './app/service/service.worker.service';
import { MainComponent } from './app/antichess/main.component';
import { EventsComponent } from './app/antichess/events.component';

import { AntichessComponent } from './app/antichess/antichess.component';
import { PlayersComponent } from './app/antichess/players.component';
import { RankComponent } from './app/antichess/rank.component';
import { TitlesComponent } from './app/antichess/titles.component';
import { AntichessGuideComponent } from './app/antichess/antichessguide.component';
import { AntichessLinksComponent } from './app/antichess/antichesslinks.component ';

function getScriptFileName(): string {
  const scripts = Array.from(document.querySelectorAll('script')); // Convert NodeList to an array
  for (const script of scripts) {
    if (script.src.includes('scripts-')) {
      const urlParts = script.src.split('/');
      return urlParts[urlParts.length - 1];
    }
  }
  return 'scripts.js';
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
      
      ServiceWorkerModule.register('./' + getScriptFileName(), {
        registrationStrategy: 'registerWhenStable:30000',
      }),
      FontAwesomeModule,
    ),
    DatePipe,
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes, withHashLocation(), withInMemoryScrolling({
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeServiceWorkerService,
      deps: [ServiceWorkerService],
      multi: true,
    },
  ],
});
