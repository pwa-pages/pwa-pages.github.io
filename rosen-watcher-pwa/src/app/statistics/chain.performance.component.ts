import { Component, OnInit } from '@angular/core';
import { EventData, EventService, EventType } from '../service/event.service';
import { DataService } from '../service/data.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import { ChartService } from '../service/chart.service';
import { Location, NgFor, NgIf } from '@angular/common';
import { ChainPerfChartDataSet } from '../../service/ts/models/chart.dataset';
import { ChainChartPerformance } from '../../service/ts/models/chart.performance';
import { Chart } from 'chart.js';
import { StorageService } from '../service/storage.service';
import { NavigationService } from '../service/navigation.service';
import { ChainService } from '../service/chain.service';
import { createChainNumber, WatchersDataService } from '../service/watchers.data.service';
import { map } from 'rxjs';
import { Token } from '../../service/ts/models/token';

@Component({
  selector: 'app-chain-performance',
  templateUrl: './chain.performance.html',
  standalone: true,
  imports: [NgFor, NgIf],
})
export class ChainPerformanceComponent extends BaseWatcherComponent implements OnInit {
  data: string;

  performanceCharts: ChainChartPerformance[] = [];
  performanceChart: Chart<'bar', { x: string | number | Date; y: number }[], unknown> | undefined;

  chainWatcherCount = createChainNumber();

  constructor(
    location: Location,
    storageService: StorageService,
    dataService: DataService,
    chainService: ChainService,
    eventService: EventService,
    private chartService: ChartService,
    navigationService: NavigationService,
    private watchersDataService: WatchersDataService,
  ) {
    super(eventService, navigationService, chainService, storageService, dataService, location);
    this.data = '';
    this.addresses = [];
  }

  selectTab(): void {
    this.navigationService.navigate('/performance');
  }

  async retrieveData(): Promise<void> {
    this.performanceCharts = await this.getPerformanceChart();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    await this.getWatchers();

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

  private async getWatchers() {
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
    //const cnt = this.performanceCharts.length;
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
