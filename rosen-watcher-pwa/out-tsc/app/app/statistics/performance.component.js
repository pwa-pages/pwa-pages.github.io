import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { NgFor, NgIf } from '@angular/common';
let PerformanceComponent = class PerformanceComponent extends BaseWatcherComponent {
    constructor(dataService, eventService, chartService, chainService, swipeService) {
        super(eventService, swipeService);
        this.dataService = dataService;
        this.chartService = chartService;
        this.chainService = chainService;
        this.chartColors = [
            '#1f77b4', // Blue
            '#2ca02c', // Green
            '#bcbd22', // Yellow-Green
            '#d62728', // Red
            '#ff7f0e', // Orange
            '#8c564b', // Brown
            '#e377c2', // Pink
            '#7f7f7f', // Gray
            '#17becf', // Turquoise
            '#9467bd', // Purple
        ];
        this.noAddresses = false;
        this.title = 'rosen-watcher-pwa';
        this.data = '';
        this.addresses = [];
        this.performanceCharts = [];
    }
    async retrieveData() {
        this.performanceCharts = await this.getPerformanceChart();
    }
    async ngOnInit() {
        super.ngOnInit();
        this.initSwipe('/watchers', '/statistics');
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
        });
        await this.retrieveData();
        this.updateChart();
        await this.subscribeToEvent(EventType.InputsStoredToDb, async () => {
            await this.retrieveData();
            this.updateChart();
        });
        await this.subscribeToEvent(EventType.EndFullDownload, async () => {
            await this.retrieveData();
            this.updateChart();
        });
    }
    async getPerformanceChart() {
        const inputsPromise = this.dataService.getWatcherInputs();
        let performanceChart = [];
        console.log('start retrieving chart from database');
        const inputs = await inputsPromise;
        const addressCharts = {};
        inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());
        const chainTypes = {};
        inputs.forEach((input) => {
            input.assets.forEach((asset) => {
                if (!addressCharts[input.outputAddress]) {
                    addressCharts[input.outputAddress] = {};
                }
                const currentDate = new Date();
                const halfYearAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
                if (input.inputDate > halfYearAgo) {
                    const dt = new Date(input.inputDate.getFullYear(), input.inputDate.getMonth(), input.inputDate.getDate() - input.inputDate.getDay()).getTime();
                    if (!addressCharts[input.outputAddress][dt]) {
                        addressCharts[input.outputAddress][dt] = 0;
                    }
                    addressCharts[input.outputAddress][dt] += asset.amount / Math.pow(10, asset.decimals);
                    chainTypes[input.outputAddress] = this.chainService.getChainType(input.address);
                }
            });
        });
        performanceChart = [];
        for (const key in addressCharts) {
            if (Object.prototype.hasOwnProperty.call(addressCharts, key)) {
                const chart = [];
                for (const ckey in addressCharts[key]) {
                    chart.push({
                        x: new Date(Number(ckey)),
                        y: addressCharts[key][ckey],
                    });
                }
                const addressForDisplay = key.substring(0, 6) + '...' + key.substring(key.length - 6, key.length);
                performanceChart.push({
                    address: key,
                    addressForDisplay: addressForDisplay,
                    chart: chart,
                    chainType: chainTypes[key],
                    color: '',
                });
            }
        }
        performanceChart.sort((a, b) => (a.chainType == null ? '' : a.chainType).localeCompare(b.chainType == null ? '' : b.chainType));
        console.log('done retrieving chart from database');
        return performanceChart.map((c, index) => ({
            ...c,
            color: this.chartColors[index % this.chartColors.length],
        }));
    }
    createDataSet(i) {
        const chartColor = this.chartColors[i % 10];
        return {
            label: '',
            data: [],
            backgroundColor: chartColor,
            pointBackgroundColor: chartColor,
            borderColor: chartColor,
            borderWidth: 0,
            borderSkipped: false,
        };
    }
    updateChart() {
        const dataSets = [];
        const cnt = this.performanceCharts.length;
        for (let i = 0; i < cnt; i++) {
            dataSets.push(this.createDataSet(i));
        }
        for (let i = 0; i < this.performanceCharts.length; i++) {
            dataSets[i].data = this.performanceCharts[i].chart;
            dataSets[i].label = 'Address: ' + this.performanceCharts[i].addressForDisplay;
        }
        if (!this.performanceChart) {
            this.performanceChart = this.chartService.createPerformanceChart(dataSets);
        }
        else {
            if (this.performanceCharts.length != this.performanceChart.data.datasets.length) {
                this.performanceChart.data.datasets = dataSets;
            }
            else {
                for (let i = 0; i < this.performanceCharts.length; i++) {
                    this.performanceChart.data.datasets[i].data = dataSets[i].data;
                }
            }
            this.performanceChart.update();
        }
    }
};
PerformanceComponent = __decorate([
    Component({
        selector: 'app-performance',
        templateUrl: './performance.html',
        standalone: true,
        imports: [NgFor, NgIf],
    })
], PerformanceComponent);
export { PerformanceComponent };
//# sourceMappingURL=performance.component.js.map