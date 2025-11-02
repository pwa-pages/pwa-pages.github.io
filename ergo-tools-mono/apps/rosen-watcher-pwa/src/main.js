"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@angular/compiler");
const routes = [
    { path: 'settings', component: settings_component_1.SettingsComponent },
    { path: 'performance', component: performance_component_1.PerformanceComponent },
    { path: 'chainperformance', component: chain_performance_component_1.ChainPerformanceComponent },
    { path: 'watchers', component: watchers_component_1.WatchersComponent },
    { path: 'mywatchers', component: mywatchers_component_1.MyWatchersComponent },
    { path: '**', component: statistics_component_1.StatisticsComponent },
];
// Import AppModule
const core_1 = require("@angular/core");
const app_component_1 = require("./app/app.component");
const angular_fontawesome_1 = require("@fortawesome/angular-fontawesome");
const core_2 = require("@angular/core");
const service_worker_1 = require("@angular/service-worker");
const animations_1 = require("@angular/platform-browser/animations");
const forms_1 = require("@angular/forms");
const statistics_component_1 = require("./app/statistics/statistics.component");
const watchers_component_1 = require("./app/statistics/watchers.component");
const performance_component_1 = require("./app/statistics/performance.component");
const settings_component_1 = require("./app/settings//settings.component");
const router_1 = require("@angular/router");
const dialog_1 = require("@angular/material/dialog");
const form_field_1 = require("@angular/material/form-field");
const input_1 = require("@angular/material/input");
const http_1 = require("@angular/common/http");
const platform_browser_1 = require("@angular/platform-browser");
const common_1 = require("@angular/common");
const service_worker_service_1 = require("./app/service/service.worker.service");
const chain_data_service_1 = require("./app/service/chain.data.service");
const chain_performance_component_1 = require("./app/statistics/chain.performance.component");
const mywatchers_component_1 = require("./app/statistics/mywatchers.component");
function getScriptFileName() {
    const scripts = Array.from(document.querySelectorAll('script')); // Convert NodeList to an array
    for (const script of scripts) {
        if (script.src.includes('scripts-')) {
            const urlParts = script.src.split('/');
            return urlParts[urlParts.length - 1];
        }
    }
    return 'scripts.js';
}
(0, platform_browser_1.bootstrapApplication)(app_component_1.AppComponent, {
    providers: [
        (0, core_2.importProvidersFrom)(platform_browser_1.BrowserModule, common_1.CommonModule, input_1.MatInputModule, form_field_1.MatFormFieldModule, dialog_1.MatDialogModule, forms_1.FormsModule, 
        //ServiceWorkerModule.register('./rosen-ngsw-worker.js', {
        service_worker_1.ServiceWorkerModule.register('./' + getScriptFileName(), {
            registrationStrategy: 'registerWhenStable:30000',
        }), angular_fontawesome_1.FontAwesomeModule),
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
        {
            provide: core_1.APP_INITIALIZER,
            useFactory: chain_data_service_1.initializeDataService,
            deps: [chain_data_service_1.ChainDataService],
            multi: true,
        },
    ],
});
