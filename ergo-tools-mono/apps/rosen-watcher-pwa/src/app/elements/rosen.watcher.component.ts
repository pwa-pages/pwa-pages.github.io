import {
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output,
} from '@angular/core';
import { IS_ELEMENTS_ACTIVE } from '../service/tokens';
import { WatchersComponent } from '../statistics/watchers.component';
import { ChainPerformanceComponent } from '../statistics/chain.performance.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EventType } from '../service/event.service';
import {
  ChainChartPerformance,
  ChartPerformance,
} from '../../service/ts/models/chart.performance';
import { StatisticsChartComponent } from './statistics.chart.component';
import { CommonModule } from '@angular/common';
import { PerformanceChartComponent } from './performance.chart.component';
import { BaseEventAwareComponent } from '../baseeventawarecomponent';
import { WatchersStats } from '../service/watchers.models';
import { MyWatchersComponent } from '../statistics/mywatchers.component';
import { MyWatchersStats } from '../../service/ts/models/watcher.info';
import { ChartPoint } from '../../service/ts/models/chart.point';

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'rosen-watcher-component',
  templateUrl: './rosen.watcher.component.html',
  standalone: true,
  imports: [
    CommonModule,
    WatchersComponent,
    MyWatchersComponent,
    ChainPerformanceComponent,
    StatisticsChartComponent,
    PerformanceChartComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [
    `
      :host ::ng-deep .elementsActive .PerformanceChart,
      :host ::ng-deep .elementsActive .RewardChart,
      :host ::ng-deep .elementsActive app-statistics-chart .chart-container,
      :host ::ng-deep .elementsActive app-statistics-chart .chartcontainer,
      :host ::ng-deep app-performance-chart.elementsActive .chart-container,
      :host ::ng-deep app-performance-chart.elementsActive .chartcontainer,
      :host ::ng-deep app-chain-performance.elementsActive,
      :host ::ng-deep app-statistics-chart.elementsActive,
      :host ::ng-deep app-performance-chart.elementsActive,
      :host ::ng-deep .elementsActive app-reward-chart {
        width: inherit;
        height: inherit;
        display: block;
      }
      :host ::ng-deep .performancecontainer.elementsActive {
        width: inherit;
        height: inherit;
      }
      :host ::ng-deep app-chain-performance.elementsActive .chart-container,
      :host ::ng-deep app-chain-performance.elementsActive .PerformanceChart,
      :host ::ng-deep app-performance-chart.elementsActive .chart-container,
      :host ::ng-deep app-performance-chart.elementsActive .PerformanceChart {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class RosenWatcherComponent extends BaseEventAwareComponent {
  private _renderHtml = true;

  @Output() notifyPermitsStatsChanged = new EventEmitter<MyWatchersStats[]>();
  @Output() notifyWatchersStatsChanged = new EventEmitter<WatchersStats>();
  @Output() notifyChainPerformanceChartsChanged = new EventEmitter<
    { chainType: string | null; chart: number }[]
  >();
  @Output() notifyPerformanceChartsChanged = new EventEmitter<
    ChartPerformance[]
  >();
  @Output() notifyStatisticsChartChanged = new EventEmitter<
    ChartPoint[]
  >();

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

  @Input() period?: string;
  @Input() chartTitle?: string;

  @Input() address1?: string;
  @Input() address2?: string;
  @Input() address3?: string;
  @Input() address4?: string;
  @Input() address5?: string;
  @Input() address6?: string;
  @Input() address7?: string;
  @Input() address8?: string;
  @Input() address9?: string;
  @Input() address10?: string;
  @Input() address11?: string;
  @Input() address12?: string;
  @Input() address13?: string;
  @Input() address14?: string;
  @Input() address15?: string;
  @Input() address16?: string;
  @Input() address17?: string;
  @Input() address18?: string;
  @Input() address19?: string;
  @Input() address20?: string;

  @Input() chartColor?: string;
  @Input() accentChartColor?: string;

  private filledAddresses: string[] = [];

  getFilledAddresses(): string[] {
    const newFilledAddresses: string[] = [];

    for (let i = 1; i <= 20; i++) {
      const address = this[`address${i}` as keyof this] as string | undefined;
      if (typeof address === 'string' && address.trim() !== '') {
        newFilledAddresses.push(address);
      }
    }

    if (
      this.filledAddresses.length !== newFilledAddresses.length ||
      !this.filledAddresses.every(
        (addr, idx) => addr === newFilledAddresses[idx],
      )
    ) {
      this.filledAddresses = newFilledAddresses;
    }

    return this.filledAddresses;
  }

  private _component = '';
  @Input()
  set component(value: string) {
    this._component = value;
  }

  public appPermitsActive(): boolean {
    return this._component === 'permits';
  }

  public appWatchersActive(): boolean {
    return this._component === 'watchers';
  }

  public appChainPerformanceActive(): boolean {
    return this._component === 'chain-performance';
  }

  public appStatisticsActive(): boolean {
    return this._component === 'statistics';
  }

  public appPerformanceActive(): boolean {
    return this._component === 'performance';
  }

  constructor(
    protected override injector: Injector,
    @Inject(IS_ELEMENTS_ACTIVE) public isElementsActive: boolean,
  ) {
    super(injector);
    console.log(
      'RosenWatcherComponent initialized with componentId:',
      this.componentId,
    );
    this.subscribeToEvent(
      EventType.WatchersStatsChanged,
      (data: WatchersStats) => {
        console.log(
          'Received watchers stats changed event, sending through notifyWatchersStatsChanged',
        );
        this.notifyWatchersStatsChanged.emit(data);
      },
    );

    this.subscribeToEvent(
      EventType.PermitsStatsChanged,
      (data: MyWatchersStats[]) => {
        console.log(
          'Received chain permits stats changed event, sending through notifyPermitsStatsChanged',
        );
        this.notifyPermitsStatsChanged.emit(data);
      },
    );

    this.subscribeToEvent(
      EventType.ChainPerformanceChartsChanged,
      (data: ChainChartPerformance[]) => {
        console.log(
          'Received chain performance changed event, sending through notifyChainPerformanceChartsChanged',
        );
        this.notifyChainPerformanceChartsChanged.emit(
          data.map(({ chainType, chart }) => ({ chainType, chart })),
        );
      },
    );

    this.subscribeToEvent(
      EventType.PerformanceChartsChanged,
      (data: ChartPerformance[]) => {
        console.log(
          'Received performance charts changed event, sending through notifyPerformanceChartsChanged',
        );
        this.notifyPerformanceChartsChanged.emit(data);
      },
    );

    this.subscribeToEvent(
      EventType.StatisticsChartChanged,
      (data: ChartPoint[]) => {
        console.log(
          'Received statistics chart changed event, sending through notifyStatisticsChartChanged',
        );
        this.notifyStatisticsChartChanged.emit(data);
      },
    );
  }
}
