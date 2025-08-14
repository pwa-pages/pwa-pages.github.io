import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ChainChartService } from '../service/chain.chart.service';
import { ChartPerformance } from '../../service/ts/models/chart.performance';
import { Chart } from 'chart.js';

import { NavigationService } from '../service/navigation.service';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.html',
  standalone: true,
  imports: [],
})
export class PerformanceComponent extends BaseWatcherComponent implements OnInit {
  data: string;
  performanceCharts: ChartPerformance[];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    injector: Injector,
    private chartService: ChainChartService,
    private navigationService: NavigationService,
  ) {
    super(injector);
    this.data = '';
    this.addresses = [];
    this.performanceCharts = [];
  }

  async retrieveData(): Promise<void> {
    this.performanceCharts = await this.getPerformanceChart();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    await this.retrieveData();
    this.performanceChart = this.chartService.createPerformanceChart(
      this.performanceCharts,
      this.chartCanvas.nativeElement,
    );
    this.updateChart();

    this.eventService.sendEvent(EventType.RequestInputsDownload);

    await this.subscribeToEvent(EventType.RefreshInputs, async () => {
      await this.retrieveData();
      this.updateChart();
    });
  }

  private async getPerformanceChart(): Promise<ChartPerformance[]> {
    console.log('start retrieving chart from database');

    const addressCharts = this.dataService.getAddressCharts();
    return this.chartService.getPerformanceChart(addressCharts);
  }

  selectTab(): void {
    this.navigationService.navigate('/chainperformance');
  }

  updateChart(): void {
    this.chartService.convertPerformanceCharts(this.performanceCharts, this.performanceChart);
    this.performanceChart?.update();
  }

  title = 'rosen-watcher-pwa';
}
