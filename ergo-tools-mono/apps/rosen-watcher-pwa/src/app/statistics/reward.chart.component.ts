import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { ChainChartService, LineChart } from '../service/chain.chart.service';
import { EventService, EventType } from '../service/event.service';
import { ChartPoint } from '@ergo-tools/service';

@Component({
  selector: 'app-reward-chart',
  templateUrl: './reward.chart.html',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    FormsModule,
  ],
})
export class RewardChartComponent implements OnChanges, AfterViewInit {
  previousLength = 0;
  chart: LineChart | null = null;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() rewardsChart: ChartPoint[] = [];
  accumulatedRewardsChart: ChartPoint[] = [];
  @Input() chartTitle? = 'Total Rewards Earned (RSN)';
  @Input() chartColor?: string;
  @Input() accentChartColor?: string;

  constructor(
    private chartService: ChainChartService,
    private eventService: EventService,
    private elementRef: ElementRef,
  ) {
    this.eventService.subscribeToEvent(EventType.WindowResized, () => {
      if (this.chart) {
        this.chart.resize();
      }
      this.updateChart();
    });
  }

  ngOnChanges(): void {
    this.setupRewardChart(this.rewardsChart);
    this.updateChart();
  }

  ngAfterViewInit(): void {
    this.observeVisibility();
  }

  updateChart(): void {
    if (!this.chart) {
      if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
        return;
      }
      const canvas = this.chartCanvas.nativeElement;
      this.chart = this.chartService.createStatisticsChart(
        canvas,
        this.accumulatedRewardsChart,
        1,
        [0.4],
        this.chartTitle || 'Total Rewards Earned (RSN)',
        this.chartColor,
        this.accentChartColor,
      );
    } else {
      this.chartService.updateStatisticsChart(
        this.chart,
        this.chartTitle || 'Total Rewards Earned (RSN)',
        this.chartColor,
        this.accentChartColor,
      );
    }

    this.chart.data.datasets[0].data = this.chartService.reduceChartData(
      this.accumulatedRewardsChart,
      20,
      true,
    );

    this.chart.update();
  }

  private setupRewardChart(amounts: ChartPoint[]) {
    if (
      this.rewardsChart.length !== 0 &&
      this.previousLength !== 0 &&
      this.previousLength !== this.rewardsChart.length &&
      this.chart
    ) {
      this.chart.options.animation = {
        duration: 1000,
      };
    }

    this.previousLength = this.rewardsChart.length;

    let accumulatedAmount = 0;
    this.accumulatedRewardsChart = amounts.map((s) => {
      accumulatedAmount += s.y;
      return { x: s.x, y: accumulatedAmount } as ChartPoint;
    });
  }

  private observeVisibility(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (this.chart) {
              this.chart.resize();
            }
            this.updateChart();
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(this.elementRef.nativeElement);
  }
}
