import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { Statistics } from './statistics/statistics';
import { Settings } from './settings/settings';
import { SettingsDialog } from './settings/dialog';
import { Permits } from './permits/permits';
import { Performance } from './statistics/performance';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RewardChartComponent } from './reward.chart/reward.chart.component';
import { PerformanceChartComponent } from './performance.chart/performance.chart.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


const routes: Routes = [
  { path: 'settings', component: Settings },
  { path: 'permits', component: Permits },
  { path: 'performance', component: Performance },
  { path: '**', component: Statistics }
  
];

@NgModule({
  declarations: [
    AppComponent,
    Settings,
    SettingsDialog,
    Permits,
    Statistics,
    Performance,
    RewardChartComponent,
    PerformanceChartComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule, 
    MatDialogModule,
    RouterModule.forRoot(routes),
    FormsModule,
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
export class AppModule {}
