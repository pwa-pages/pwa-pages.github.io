import { Component, Input, OnChanges } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { ChartService, LineChart } from '../service/chart.service';

@Component({
  selector: 'app-reward-chart',
  templateUrl: './reward.chart.html',
  standalone: true,
  imports: [MatDatepickerModule, MatInputModule, MatNativeDateModule, FormsModule],
})
export class RewardChartComponent implements OnChanges {
  previousLength = 0;

  constructor(private chartService: ChartService) {}
  ngOnChanges(): void {
    this.setupRewardChart(this.rewardsChart);
    this.updateChart();
  }
  chart: LineChart | null = null;
  @Input() rewardsChart: DateNumberPoint[] = [];

  updateChart(): void {
    if (!this.chart) {
      this.chart = this.chartService.createStatisticsChart(this.rewardsChart, 1, [0.4]);
    }

    this.chart.data.datasets[0].data = this.chartService.reduceChartData(
      this.rewardsChart,
      20,
      true,
    );

    this.chart.update();
  }

  private setupRewardChart(amounts: DateNumberPoint[]) {
    if (
      this.rewardsChart.length != 0 &&
      this.previousLength != 0 &&
      this.previousLength != this.rewardsChart.length &&
      this.chart
    ) {
      this.chart.options.animation = {
        duration: 1000,
      };
    }

    this.previousLength = this.rewardsChart.length;

    let accumulatedAmount = 0;
    this.rewardsChart = amounts.map((s) => {
      accumulatedAmount += s.y;
      return { x: s.x, y: accumulatedAmount } as DateNumberPoint;
    });
  }
}
