import { Component, Inject, Injector, OnInit } from '@angular/core';
import { EventData, EventType } from '../service/event.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ChartService } from '../service/chart.service';

import { ChainPerfChartDataSet } from '../../service/ts/models/chart.dataset';
import { ChainChartPerformance } from '../../service/ts/models/chart.performance';
import { Chart } from 'chart.js';
import { NavigationService } from '../service/navigation.service';
import { createChainNumber, WatchersDataService } from '../service/watchers.data.service';
import { map } from 'rxjs';
import { Token } from '../../service/ts/models/token';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chain-performance',
  templateUrl: './chain.performance.html',
  standalone: true,
  imports: [CommonModule],
})
export class ChainPerformanceComponent extends BaseWatcherComponent implements OnInit {
  performanceCharts: ChainChartPerformance[] = [];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined;

  chainWatcherCount = createChainNumber();

  constructor(
    injector: Injector,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
    private chartService: ChartService,
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
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    this.getWatchers();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    await this.retrieveData();
    this.updateChart();

    this.eventService.sendEventWithData(
      EventType.PerformanceScreenLoaded,
      this.storageService.getProfile() as EventData,
    );

    await this.subscribeToEvent(EventType.RefreshInputs, async () => {
      await this.retrieveData();
      this.updateChart();
    });

    this.eventService.sendEventWithData(
      EventType.RequestInputsDownload,
      this.storageService.getProfile() as EventData,
    );
  }

  private getWatchers() {
    const watcherInfo$ = this.watchersDataService.getWatchersInfo();

    Object.values(ChainType).forEach((c) => {
      watcherInfo$
        .pipe(
          map(
            (watcherInfo) =>
              watcherInfo.tokens.find((token: Token) => token.name === 'rspv2' + c + 'AWC')
                ?.amount ?? 0,
          ),
        )
        .subscribe((amount) => {
          this.chainWatcherCount[c] = amount;
          this.updateChart();
        });
    });
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
    const dataSet = this.createDataSet(0);
    //const cnt = this.performanceCharts.length;

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
    //dataSet.label = this.performanceCharts.map(p => p.chainType);

    if (!this.performanceChart) {
      this.performanceChart = this.chartService.createChainPerformanceChart(dataSet);
    } else {
      this.performanceChart.data.datasets[0].data = dataSet.data;

      this.performanceChart.data.datasets[0].backgroundColor = this.chartService.chartColors;
      this.performanceChart.update();
    }
  }

  title = 'rosen-watcher-pwa';
}
