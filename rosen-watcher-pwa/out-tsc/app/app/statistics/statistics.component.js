import { __decorate } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgStyle, NgFor } from '@angular/common';
import { QRDialogComponent } from './qrdialog.component';
import 'chartjs-adapter-date-fns';
let StatisticsComponent = class StatisticsComponent extends BaseWatcherComponent {
    constructor(location, route, storageService, dataService, 
    //private downloadDataService: DownloadDataService,
    chartService, eventService, swipeService, router, qrDialog) {
        super(eventService, swipeService);
        this.location = location;
        this.route = route;
        this.storageService = storageService;
        this.dataService = dataService;
        this.chartService = chartService;
        this.router = router;
        this.qrDialog = qrDialog;
        this.noAddresses = false;
        this.shareSupport = false;
        this.title = 'rosen-watcher-pwa';
        this.data = '';
        this.selectedTab = 'chart';
        this.addresses = [];
        this.addressesForDisplay = [];
        this.rewardsChart = [];
        this.sortedInputs = [];
        this.detailInputs = [];
    }
    showHomeLink() {
        return window.showHomeLink == true;
    }
    selectTab(tab) {
        this.selectedTab = tab;
    }
    formatDate(utcDate) {
        const day = utcDate.getUTCDate().toString().padStart(2, '0');
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const month = monthNames[utcDate.getUTCMonth()];
        const year = utcDate.getUTCFullYear();
        return `${day} ${month} ${year}`;
    }
    async retrieveData() {
        this.sortedInputs = await this.dataService.getSortedInputs();
        const newChart = this.sortedInputs.map((s) => {
            return { x: s.inputDate, y: s.accumulatedAmount };
        });
        this.sortedInputs.sort((a, b) => b.inputDate.getTime() - a.inputDate.getTime());
        this.detailInputs = this.sortedInputs.slice(0, 100);
        if (this.rewardsChart.length != 0 &&
            newChart.length != this.rewardsChart.length &&
            this.chart) {
            this.chart.options.animation = {
                duration: 1000,
            };
        }
        this.rewardsChart = newChart;
        this.updateChart();
        this.data = await this.dataService.getTotalRewards(this.sortedInputs);
        this.addressesForDisplay = await this.dataService.getAddressesForDisplay(this.sortedInputs);
    }
    updateChart() {
        if (!this.chart) {
            this.chart = this.chartService.createStatisticsChart(this.rewardsChart);
        }
        this.chart.data.datasets[0].data = this.chartService.reduceChartData(this.rewardsChart, 15);
        this.chart.update();
    }
    installApp() {
        if (window.deferredPrompt) {
            window.deferredPrompt?.prompt();
            window.deferredPrompt?.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    window.showHomeLink = false;
                }
                window.deferredPrompt = undefined;
            });
        }
    }
    showQR() {
        this.qrDialog.open(QRDialogComponent, {
            data: { qrData: this.getShareUrl() },
        });
    }
    getShareUrl() {
        const currentUrl = window.location.pathname;
        const subdirectory = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
        const urlTree = this.router.createUrlTree(['main'], {
            queryParams: { addresses: JSON.stringify(this.addresses) },
        });
        const url = window.location.origin + subdirectory + this.router.serializeUrl(urlTree);
        return url;
    }
    share() {
        const url = this.getShareUrl();
        console.log('share url: ' + url);
        navigator.share({
            title: 'Rosen Watcher',
            text: 'Rosen Watcher',
            url: url,
        });
    }
    async ngOnInit() {
        super.ngOnInit();
        this.updateChart();
        this.route.queryParams.subscribe(async (params) => {
            await this.checkAddressParams(params);
            await this.retrieveData().then(async () => {
                this.eventService.sendEvent(EventType.StatisticsScreenLoaded);
                //await this.downloadDataService.downloadForAddresses();
            });
        });
        this.shareSupport = navigator.share != null && navigator.share != undefined;
        this.initSwipe('/performance', '/watchers');
        window.addEventListener('beforeinstallprompt', (event) => {
            window.showHomeLink = true;
            event.preventDefault();
            window.deferredPrompt = event;
        });
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
        });
        await this.subscribeToEvent(EventType.InputsStoredToDb, async () => {
            await this.retrieveData();
        });
        await this.subscribeToEvent(EventType.EndFullDownload, async () => {
            await this.retrieveData();
        });
    }
    async checkAddressParams(params) {
        if (params['addresses']) {
            const addressesParam = params['addresses'];
            console.log(addressesParam);
            this.addresses = JSON.parse(decodeURIComponent(addressesParam));
            const currentPath = this.location.path();
            if (currentPath.includes('?')) {
                const parts = currentPath.split('?');
                const newPath = parts[0];
                this.location.replaceState(newPath);
            }
            await this.storageService.putAddressData(this.addresses);
            await this.storageService.clearInputsStore();
            if (this.addresses.length == 0) {
                this.noAddresses = true;
            }
            return true;
        }
        else {
            this.addresses = await this.dataService.getAddresses();
            if (this.addresses.length == 0) {
                this.noAddresses = true;
            }
            return false;
        }
    }
};
__decorate([
    ViewChild('detailsContainer')
], StatisticsComponent.prototype, "detailsContainer", void 0);
StatisticsComponent = __decorate([
    Component({
        selector: 'app-statistics',
        templateUrl: './statistics.html',
        standalone: true,
        imports: [NgIf, NgStyle, NgFor, RouterLink, RouterLinkActive],
    })
], StatisticsComponent);
export { StatisticsComponent };
//# sourceMappingURL=statistics.component.js.map