import { Component, OnInit } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { DataService } from '../service/data.service';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ChartService } from '../service/chart.service';
import { NgFor, NgIf } from '@angular/common';
import { ChartDataSet } from '../../service/ts/models/chart.dataset';
import { ChartPoint } from '../../service/ts/models/chart.point';
import { ChartPerformance } from '../../service/ts/models/chart.performance';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.html',
  standalone: true,
  imports: [NgFor, NgIf],
})
export class PerformanceComponent extends BaseWatcherComponent implements OnInit {
  data: string;
  performanceCharts: ChartPerformance[];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined;
  addresses: string[];
  noAddresses = false;

  constructor(
    private dataService: DataService,
    eventService: EventService,
    private chartService: ChartService,
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

    const addressCharts = this.dataService.getAddressCharts();

    performanceChart = [];

    for (const key in addressCharts) {
      if (Object.prototype.hasOwnProperty.call(addressCharts, key)) {
        const chart: ChartPoint[] = [];
        for (const ckey in addressCharts[key].charts) {
          chart.push({
            x: new Date(Number(ckey)),
            y: addressCharts[key].charts[ckey],
          });
        }
        const addressForDisplay =
          key.substring(0, 6) + '...' + key.substring(key.length - 6, key.length);
        performanceChart.push({
          address: key,
          addressForDisplay: addressForDisplay,
          chart: chart,
          chainType: addressCharts[key].chainType,
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
      color: this.chartService.chartColors[index % this.chartService.chartColors.length],
    }));
  }

  private createDataSet(i: number): ChartDataSet {
    const chartColor = this.chartService.chartColors[i % 10];
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
