import { Component, OnInit, Input as AngularInput, ElementRef, ViewChild } from '@angular/core';
import 'chartjs-adapter-date-fns';
import { DateUtils } from '../statistics/date.utils';
import { ChartPerformance } from '../../service/ts/models/chart.performance';
import { Chart } from 'chart.js';
import { ChainChartService } from '../service/chain.chart.service';
import { EventService, EventType } from '../service/event.service';
import { ChainDataService } from '../service/chain.data.service';

@Component({
  selector: 'app-performance-chart',
  templateUrl: './performance.chart.html',
  standalone: true,
})
export class PerformanceChartComponent implements OnInit {
  DateUtils = DateUtils;
  @AngularInput() period?: Period;
  previousPeriod?: Period;
  @AngularInput() chartTitle?: string;
  chartFullTitle?: string;
  downloadInProgress: Record<string, boolean> = {};
  @AngularInput()
  filledAddresses: string[] = [];
  prevFilledAddresses: string[] = [];
  @AngularInput()
  chartColor?: string;
  @AngularInput()
  accentChartColor?: string;
  performanceCharts: ChartPerformance[];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined;
  private _renderHtml = true;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  @AngularInput()
  set renderHtml(value: string | boolean) {
    this._renderHtml = value === false || value === 'false' ? false : true;
  }

  get renderHtml(): boolean {
    return this._renderHtml;
  }
  isHtmlRenderEnabled(): boolean {
    return this._renderHtml;
  }
  amounts: DateNumberPoint[] = [];

  constructor(
    private chartService: ChainChartService,
    private eventService: EventService,
    private dataService: ChainDataService,
  ) {
    this.performanceCharts = [];
  }

  async retrieveData(): Promise<void> {
    this.performanceCharts = await this.getPerformanceChart();
  }

  async ngOnInit(): Promise<void> {
    await this.retrieveData();
    this.performanceChart = this.chartService.createPerformanceChart(
      this.performanceCharts,
      this.chartCanvas.nativeElement,
    );
    this.updateChart();

    this.eventService.sendEvent(EventType.RequestInputsDownload);

    await this.eventService.subscribeToEvent(EventType.RefreshInputs, async () => {
      await this.retrieveData();
      this.updateChart();
    });
  }

  private async getPerformanceChart(): Promise<ChartPerformance[]> {
    console.log('start retrieving chart from database');

    const addressCharts = this.dataService.getAddressCharts();
    return this.chartService.getPerformanceChart(addressCharts);
  }

  updateChart(): void {
    this.chartService.convertPerformanceCharts(this.performanceCharts, this.performanceChart);
    this.performanceChart?.update();
  }
}
