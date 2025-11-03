import { Component, ElementRef, Inject, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { EventData, EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ChainChartService } from '../service/chain.chart.service';

import { ChainPerfChartDataSet } from '../../service/ts/models/chart.dataset';
import { ChainChartPerformance } from '../../service/ts/models/chart.performance';
import { Chart } from 'chart.js';
import { NavigationService } from '../service/navigation.service';
import { WatchersDataService } from '../service/watchers.data.service';
import { map } from 'rxjs';
import { Token } from '../../service/ts/models/token';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { CommonModule } from '@angular/common';
import { createChainNumber } from '../service/watchers.models';

@Component({
  selector: 'app-chain-performance',
  templateUrl: './chain.performance.html',
  standalone: true,
  imports: [CommonModule],
})
export class ChainPerformanceComponent extends BaseWatcherComponent implements OnInit {
  private _renderHtml = true;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input()
  set renderHtml(value: string | boolean) {
    this._renderHtml = value === false || value === 'false' ? false : true;
  }

  get renderHtml(): boolean {
    return this._renderHtml;
  }

  isHtmlRenderEnabled(): boolean {
    return this._renderHtml;
  }

  performanceCharts: ChainChartPerformance[] = [];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined;

  chainWatcherCount = createChainNumber();

  constructor(
    injector: Injector,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
    private chartService: ChainChartService,
    private navigationService: NavigationService,
    private watchersDataService: WatchersDataService,
  ) {
    super(injector);
  }

  selectTab(): void {
    this.navigationService.navigate('/performance');
  }

  async retrieveData(): Promise<void> {
    this.performanceCharts = await this.getPerformanceChart();
    this.eventService.sendEventWithData(
      EventType.ChainPerformanceChartsChanged,
      this.performanceCharts as EventData,
    );
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.getWatchers();

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

  private getWatchers() {
    const watcherInfo$ = this.watchersDataService.getWatchersInfo();

    watcherInfo$
      .pipe(
        map((watcherInfo) => {
          Object.values(ChainType).forEach((c) => {
            const amount =
              watcherInfo.tokens.find(
                (token: Token) => token.name === chainTypeWatcherIdentifier[c],
              )?.amount ?? 0;
            this.chainWatcherCount[c] = amount;
          });
          this.updateChart();
        }),
      )
      .subscribe();
  }

  private async getPerformanceChart(): Promise<ChainChartPerformance[]> {
    console.log('start retrieving chart from database');
    const chainChart = this.dataService.getChainChart();
    console.log('done retrieving chart from database');

    return Object.entries(chainChart).map(([chainType, value], index) => ({
      color: this.chartService.chartColors[index % this.chartService.chartColors.length],
      chainType: chainType as ChainType,
      chart: value.chart,
      index: index,
      address: '',
      addressForDisplay: '',
    }));
  }

  private createDataSet(i: number): ChainPerfChartDataSet {
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
    if (!this._renderHtml) {
      return;
    }

    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    const dataSet = this.createDataSet(0);

    dataSet.data = this.performanceCharts.map((p) => {
      if (p.chainType && this.chainWatcherCount[p.chainType]) {
        return {
          x: p.chainType as string,
          y: p.chart / (this.chainWatcherCount[p.chainType] ?? 1),
        };
      } else {
        return { x: p.chainType as string, y: 0 };
      }
    });

    if (!this.performanceChart) {
      this.performanceChart = this.chartService.createChainPerformanceChart(dataSet, canvas);
    } else {
      this.performanceChart.data.datasets[0].data = dataSet.data;

      this.performanceChart.data.datasets[0].backgroundColor = this.chartService.chartColors;
      this.performanceChart.update();
    }
  }

  title = 'rosen-watcher-pwa';
}
