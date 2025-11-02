import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
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
export class PerformanceComponent
  extends BaseWatcherComponent
  implements OnInit
{
  data: string;
  performanceCharts: ChartPerformance[];
  performanceChart:
    | Chart<'bar', { x: string | number | Date; y: number }[], unknown>
    | undefined;
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

    let addresses = await this.dataService.getAddresses();
    const addressCharts = this.dataService.getAddressCharts();

    if (Array.isArray(addressCharts)) {
      const filtered = addressCharts.filter((ac: ChartPerformance) =>
        addresses.includes(ac.address),
      );
      addressCharts.splice(0, addressCharts.length, ...filtered);
    } else if (addressCharts && typeof addressCharts === 'object') {
      for (const key of Object.keys(addressCharts as Record<string, unknown>)) {
        if (!addresses.includes(key)) {
          delete (addressCharts as Record<string, unknown>)[key];
        }
      }
    }

    let result = this.chartService.getPerformanceChart(addressCharts);

    return (await result).filter((chart) => addresses.includes(chart.address));
  }

  selectTab(): void {
    this.navigationService.navigate('/chainperformance');
  }

  updateChart(): void {
    this.chartService.convertPerformanceCharts(
      this.performanceCharts,
      this.performanceChart,
    );
    this.performanceChart?.update();
  }

  title = 'rosen-watcher-pwa';
}
