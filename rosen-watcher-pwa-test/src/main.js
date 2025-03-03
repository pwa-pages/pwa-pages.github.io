"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@angular/compiler");
var routes = [
    { path: 'settings', component: settings_component_1.SettingsComponent },
    { path: 'performance', component: performance_component_1.PerformanceComponent },
    { path: 'watchers', component: watchers_component_1.WatchersComponent },
    { path: '**', component: statistics_component_1.StatisticsComponent },
];
// Import AppModule
var core_1 = require("@angular/core");
var app_component_1 = require("./app/app.component");
var angularx_qrcode_1 = require("angularx-qrcode");
var angular_fontawesome_1 = require("@fortawesome/angular-fontawesome");
var core_2 = require("@angular/core");
var service_worker_1 = require("@angular/service-worker");
var animations_1 = require("@angular/platform-browser/animations");
var forms_1 = require("@angular/forms");
var statistics_component_1 = require("./app/statistics/statistics.component");
var watchers_component_1 = require("./app/statistics/watchers.component");
var performance_component_1 = require("./app/statistics/performance.component");
var settings_component_1 = require("./app/settings//settings.component");
var router_1 = require("@angular/router");
var dialog_1 = require("@angular/material/dialog");
var form_field_1 = require("@angular/material/form-field");
var input_1 = require("@angular/material/input");
var http_1 = require("@angular/common/http");
var platform_browser_1 = require("@angular/platform-browser");
var common_1 = require("@angular/common");
var service_worker_service_1 = require("./app/service/service.worker.service");
(0, platform_browser_1.bootstrapApplication)(app_component_1.AppComponent, {
    providers: [
        (0, core_2.importProvidersFrom)(platform_browser_1.BrowserModule, common_1.CommonModule, input_1.MatInputModule, form_field_1.MatFormFieldModule, dialog_1.MatDialogModule, forms_1.FormsModule, service_worker_1.ServiceWorkerModule.register('./assets/js/service/box.download.service.js', {
            registrationStrategy: 'registerWhenStable:30000',
        }), angular_fontawesome_1.FontAwesomeModule, angularx_qrcode_1.QRCodeModule),
        common_1.DatePipe,
        (0, http_1.provideHttpClient)((0, http_1.withInterceptorsFromDi)()),
        (0, router_1.provideRouter)(routes),
        (0, animations_1.provideAnimations)(),
        {
            provide: core_1.APP_INITIALIZER,
            useFactory: service_worker_service_1.initializeServiceWorkerService,
            deps: [service_worker_service_1.ServiceWorkerService],
            multi: true,
        },
    ],
});
