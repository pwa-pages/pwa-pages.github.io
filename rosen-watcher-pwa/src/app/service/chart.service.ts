import { Injectable } from '@angular/core';
import Chart, { ChartDataset, TooltipItem } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

export type LineChart = Chart<
  'line',
  {
    x: Date;
    y: number;
  }[],
  unknown
>;

export interface DateNumberPoint {
  x: Date;
  y: number;
}

export enum Period {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'year',
  All = 'All',
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  createPerformanceChart(
    datasets: ChartDataset<'bar', { x: string | number | Date; y: number }[]>[],
  ): Chart<'bar', { x: string | number | Date; y: number }[], unknown> {
    return new Chart<'bar', { x: string | number | Date; y: number }[]>('PerformanceChart', {
      type: 'bar',
      data: {
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            stacked: true,
            alignToPixels: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              callback: function (value: number | string) {
                return (value as number).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                });
              },
            },
          },
          x: {
            type: 'time',
            stacked: true,
            alignToPixels: true,
            time: {
              unit: 'week',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            bodyFont: {
              size: 14,
            },
            titleFont: {
              size: 16,
              weight: 'bold',
            },
            callbacks: {
              label: function (context: TooltipItem<'bar'>) {
                const value = context.raw as { y: number };
                return (
                  context.dataset.label +
                  ': ' +
                  value.y.toLocaleString('en-US', { minimumFractionDigits: 2 })
                );
              },
            },
          },
          legend: {
            display: false,
          },
        },
        elements: {
          bar: {
            borderWidth: 0,
            borderRadius: 0,
            borderSkipped: false,
          },
        },
      },
    });
  }

  createStatisticsChart(rewardsChart: DateNumberPoint[]): LineChart {
    return new Chart<'line', DateNumberPoint[]>('RewardChart', {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Total rewards earned (RSN)',
            data: rewardsChart,
            borderColor: 'rgb(138, 128, 128)',
            backgroundColor: 'rgba(138, 128, 128, 0.2)',
            borderWidth: 4,
            pointBackgroundColor: 'rgb(138, 128, 128)',
            cubicInterpolationMode: 'default',
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
        },
        scales: {
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              callback: function (value: number | string) {
                return (value as number) / 1000;
              },
            },
          },
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            bodyFont: {
              size: 14,
            },
            titleFont: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            labels: {
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  }

  calculateTriangleArea(p1: DateNumberPoint, p2: DateNumberPoint, p3: DateNumberPoint): number {
    return Math.abs(
      (p1.x.getTime() * (p2.y - p3.y) +
        p2.x.getTime() * (p3.y - p1.y) +
        p3.x.getTime() * (p1.y - p2.y)) /
        2,
    );
  }

  reduceChartData(data: DateNumberPoint[], targetPoints: number): DateNumberPoint[] {
    const firstPoint = data[0]?.y;
    data = data.map((r) => {
      return { x: r.x, y: r.y - firstPoint };
    });

    let points = data.slice();

    let remainingPoints = points.length - targetPoints;
    if (remainingPoints <= 0) {
      return points;
    }

    while (remainingPoints > 0) {
      let minArea = Infinity;
      let indexToRemove = -1;

      for (let i = 1; i < points.length - 1; i++) {
        const area = this.calculateTriangleArea(points[i - 1], points[i], points[i + 1]);
        if (area < minArea) {
          minArea = area;
          indexToRemove = i;
        }
      }

      if (indexToRemove !== -1) {
        points.splice(indexToRemove, 1);
        remainingPoints--;
      } else {
        break;
      }
    }

    const timeValuesX = points.map((p) => p.x.getTime());
    const minTimeX = Math.min(...timeValuesX);
    const maxTimeX = Math.max(...timeValuesX);
    const timeRangeX = maxTimeX - minTimeX;

    const idealSpacingX = timeRangeX;
    const thresholdX = idealSpacingX * 0.03;

    let newPoints: DateNumberPoint[] = [];

    newPoints[0] = points[0];

    for (let i = 1; i < points.length; i++) {
      const timeDiff = points[i].x.getTime() - points[i - 1].x.getTime();
      if (timeDiff >= thresholdX) {
        newPoints.push(points[i]);
      } else if (i == points.length - 1) {
        newPoints[newPoints.length - 1] = points[i];
      }
    }

    points = newPoints;

    newPoints = [];
    newPoints[0] = points[0];

    const valuesY = points.map((p) => p.y);
    const minY = Math.min(...valuesY);
    const maxY = Math.max(...valuesY);
    const rangeY = maxY - minY;

    const idealSpacingY = rangeY;
    const thresholdY = idealSpacingY * 0.03;

    for (let i = 1; i < points.length; i++) {
      const diff = points[i].y - points[i - 1].y;
      if (diff >= thresholdY) {
        newPoints.push(points[i]);
      } else if (i == points.length - 1) {
        newPoints[newPoints.length - 1] = points[i];
      }
    }

    points = newPoints;

    return points;
  }
}
