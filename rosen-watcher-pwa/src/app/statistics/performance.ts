import { Component, OnInit } from '@angular/core';
import { EventService } from '../service/event.service';
import { DataService } from '../service/data.service';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import Chart from 'chart.js/auto';
import { ChainService } from '../service/chain.service';
import { ChartService } from '../service/chart.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'performance',
  templateUrl: './performance.html',
  standalone: true,
  imports: [NgFor, NgIf],
})
export class Performance extends BaseWatcherComponent implements OnInit {
  readonly chartColors: string[] = [
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

  data: string;
  performanceChart: any[];
  addresses: string[];
  noAddresses = false;
  addressesForDisplay: any[];

  chart: Chart<'bar', any[][], unknown> | undefined;

  constructor(
    private dataService: DataService,
    eventService: EventService,
    private chartService: ChartService,
    private chainService: ChainService,
    swipeService: SwipeService,
  ) {
    super(eventService, swipeService);
    this.data = '';
    this.addresses = [];
    this.performanceChart = [];
    this.addressesForDisplay = [];
  }

  async retrieveData(): Promise<void> {
    this.performanceChart = await this.getPerformanceChart();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.initSwipe('/watchers', '/statistics');

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    await this.retrieveData();
    this.updateChart();
  }

  private async getPerformanceChart(): Promise<any[]> {
    const inputsPromise = this.dataService.getWatcherInputs();
    let performanceChart: any = [];

    console.log('start retrieving chart from database');
    try {
      const inputs = await inputsPromise;
      const addressCharts: any = {};

      inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

      const chainTypes: any = {};

      inputs.forEach((input: any) => {
        input.assets.forEach((asset: any) => {
          if (!addressCharts[input.outputAddress]) {
            addressCharts[input.outputAddress] = {};
          }

          const currentDate = new Date();
          const halfYearAgo = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 6,
            currentDate.getDate(),
          );

          if (input.inputDate > halfYearAgo) {
            const dt = new Date(
              input.inputDate.getFullYear(),
              input.inputDate.getMonth(),
              input.inputDate.getDate() - input.inputDate.getDay(),
            ).getTime();
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
        if (addressCharts.hasOwnProperty(key)) {
          const chart: any[] = [];
          for (const ckey in addressCharts[key]) {
            chart.push({
              x: new Date(Number(ckey)),
              y: addressCharts[key][ckey],
            });
          }
          const addressForDisplay =
            key.substring(0, 6) + '...' + key.substring(key.length - 6, key.length);
          performanceChart.push({
            address: key,
            addressForDisplay: addressForDisplay,
            chart: chart,
            chainType: chainTypes[key],
          });
        }
      }

      performanceChart.sort((a: any, b: any) => a.chainType.localeCompare(b.chainType));

      console.log('done retrieving chart from database');
    } catch (error) {}

    return performanceChart.map((c: any, index: any) => ({
      ...c,
      color: this.chartColors[index % this.chartColors.length],
    }));
  }

  private createDataSet(i: number): any {
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

  updateChart(): void {
    if (!this.chart) {
      const dataSets = [];
      const cnt = this.performanceChart.length;
      for (var i = 0; i < cnt; i++) {
        dataSets.push(this.createDataSet(i));
      }

      for (var i = 0; i < this.performanceChart.length; i++) {
        dataSets[i].data = this.performanceChart[i].chart;
        dataSets[i].label = 'Address: ' + this.performanceChart[i].addressForDisplay;
      }
      this.chartService.createPerformanceChart(dataSets);
    }
  }

  title = 'rosen-watcher-pwa';
}
