import {
  Component,
  OnInit,
  Input as AngularInput,
  ElementRef,
  ViewChild,
  Injector,
  OnChanges,
} from '@angular/core';
import 'chartjs-adapter-date-fns';
import { DateUtils } from '../statistics/date.utils';
import { ChartPerformance } from '../../service/ts/models/chart.performance';
import { Chart } from 'chart.js';
import { ChainChartService } from '../service/chain.chart.service';
import { EventType } from '../service/event.service';
import { ChainDataService } from '../service/chain.data.service';
import { BaseEventAwareComponent } from '../baseeventawarecomponent';

@Component({
  selector: 'app-performance-chart',
  templateUrl: './performance.chart.html',
  standalone: true,
})
export class PerformanceChartComponent
  extends BaseEventAwareComponent
  implements OnInit, OnChanges
{
  DateUtils = DateUtils;
  downloadInProgress: Record<string, boolean> = {};
  @AngularInput()
  filledAddresses: string[] = [];
  prevFilledAddresses: string[] = [];
  @AngularInput()
  accentChartColor?: string;
  prevAccentChartColor?: string;
  performanceCharts: ChartPerformance[];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined =
    undefined;
  private _renderHtml = true;
  @ViewChild('performanceChartCanvas') performanceChartCanvas!: ElementRef<HTMLCanvasElement>;

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
    protected override injector: Injector,
    private chartService: ChainChartService,
    private dataService: ChainDataService,
  ) {
    super(injector);
    this.performanceCharts = [];
  }

  async retrieveData(): Promise<void> {
    this.performanceCharts = await this.getPerformanceChart();
    this.eventService.sendEventWithData(EventType.PerformanceChartsChanged, this.performanceCharts);
  }

  ngOnChanges(): void {
    if (
      !this.prevFilledAddresses ||
      this.filledAddresses.length !== this.prevFilledAddresses.length ||
      !this.filledAddresses.every((addr, i) => addr === this.prevFilledAddresses![i])
    ) {
      this.prevFilledAddresses = [...this.filledAddresses];
      this.dataService.setAddresses(this.filledAddresses);
      this.updateCharts();
    }

    if (this.accentChartColor !== this.prevAccentChartColor) {
      this.prevAccentChartColor = this.accentChartColor;
      this.updateCharts();
    }
  }

  private async updateCharts() {
    await this.retrieveData();
    if (!this.performanceChart) {
      this.performanceChart = this.chartService.createPerformanceChart(
        this.performanceCharts,
        this.performanceChartCanvas.nativeElement,
        this.accentChartColor,
      );
    }

    this.updateChart();

    for (const address of this.filledAddresses) {
      await this.eventService.sendEventWithData(EventType.RequestInputsDownload, address);
    }

    await this.subscribeToEvent(EventType.RefreshInputs, async () => {
      await this.retrieveData();
      this.updateChart();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.updateCharts();
  }

  private async getPerformanceChart(): Promise<ChartPerformance[]> {
    console.log('start retrieving chart from database');

    const addressCharts = this.dataService.getAddressCharts();
    let addresses = this.chartService.getPerformanceChart(addressCharts);
    return (await addresses).filter((chart) => this.filledAddresses.includes(chart.address));
  }

  updateChart(): void {
    this.chartService.convertPerformanceCharts(
      this.performanceCharts,
      this.performanceChart,
      this.accentChartColor,
    );
    this.performanceChart?.update();
  }
}
