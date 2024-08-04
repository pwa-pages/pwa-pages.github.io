import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { Statistics } from './statistics/statistics';
import { Settings } from './settings/settings';
import { SettingsDialog } from './settings/dialog';
import { QRDialog } from './statistics/qrdialog';
import { Permits } from './permits/permits';
import { Performance } from './statistics/performance';
import { Watchers } from './statistics/watchers';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QRCodeModule } from 'angularx-qrcode';

const routes: Routes = [
  { path: 'settings', component: Settings },
  { path: 'permits', component: Permits },
  { path: 'performance', component: Performance },
  { path: 'watchers', component: Watchers },
  { path: '**', component: Statistics },
];

@NgModule({
  declarations: [
    AppComponent,
    Settings,
    SettingsDialog,
    QRDialog,
    Permits,
    Statistics,
    Performance,
    Watchers,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    RouterModule.forRoot(routes),
    FormsModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    FontAwesomeModule,
    QRCodeModule,
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
