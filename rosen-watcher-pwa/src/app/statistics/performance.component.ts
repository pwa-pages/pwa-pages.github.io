import { Component, OnInit } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { DataService } from '../service/data.service';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ChainService } from '../service/chain.service';
import { ChainType } from '../../service/ts/models/chaintype';
import { ChartService } from '../service/chart.service';
import { NgFor, NgIf } from '@angular/common';
import { ChartDataSet } from '../../service/ts/models/chart.dataset';
import { ChartPoint } from '../../service/ts/models/chart.point';
import { ChartPerformance } from '../../service/ts/models/chart.performance';
import { Input } from '../../service/ts/models/input';
import { Asset } from '../../service/ts/models/asset';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.html',
  standalone: true,
  imports: [NgFor, NgIf],
})
export class PerformanceComponent extends BaseWatcherComponent implements OnInit {
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
  performanceCharts: ChartPerformance[];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined;
  addresses: string[];
  noAddresses = false;

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
    this.performanceCharts = [];
  }

  async retrieveData(): Promise<void> {
    this.performanceCharts = await this.getPerformanceChart();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.initSwipe('/watchers', '/statistics');

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    await this.retrieveData();
    this.updateChart();

    this.eventService.sendEvent(EventType.PerformanceScreenLoaded);

    await this.subscribeToEvent(EventType.RefreshInputs, async () => {
      await this.retrieveData();
      this.updateChart();
    });
  }

  private async getPerformanceChart(): Promise<ChartPerformance[]> {
    let performanceChart: ChartPerformance[] = [];

    console.log('start retrieving chart from database');

    const inputs = this.dataService.getSortedInputs();
    const addressCharts: Record<string, Record<number, number>> = {};

    inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

    const chainTypes: Record<string, ChainType | null> = {};

    inputs.forEach((input: Input) => {
      input.assets.forEach((asset: Asset) => {
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
      if (Object.prototype.hasOwnProperty.call(addressCharts, key)) {
        const chart: ChartPoint[] = [];
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
          color: '',
        });
      }
    }

    performanceChart.sort((a: ChartPerformance, b: ChartPerformance) =>
      (a.chainType == null ? '' : a.chainType).localeCompare(
        b.chainType == null ? '' : b.chainType,
      ),
    );

    console.log('done retrieving chart from database');

    return performanceChart.map((c: ChartPerformance, index: number) => ({
      ...c,
      color: this.chartColors[index % this.chartColors.length],
    }));
  }

  private createDataSet(i: number): ChartDataSet {
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
    } else {
      if (this.performanceCharts.length != this.performanceChart.data.datasets.length) {
        this.performanceChart.data.datasets = dataSets;
      } else {
        for (let i = 0; i < this.performanceCharts.length; i++) {
          this.performanceChart.data.datasets[i].data = dataSets[i].data;
        }
      }

      this.performanceChart.update();
    }
  }

  title = 'rosen-watcher-pwa';
}
