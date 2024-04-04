import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { AppChart } from './app.chart';
import { AppSettings } from './app.settings';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RewardChartComponent } from './reward.chart/reward.chart.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

const routes: Routes = [
  { path: 'settings', component: AppSettings },
  { path: '**', component: AppChart }
  
];

@NgModule({
  declarations: [
    AppComponent,
    AppSettings,
    AppChart,
    RewardChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule.forRoot(routes),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    FontAwesomeModule
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {faCoffee = faCoffee; }
