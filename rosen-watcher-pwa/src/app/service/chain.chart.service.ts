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

@Injectable({
  providedIn: 'root',
})
export class ChainChartService {
  readonly chartColors: string[] = [
    '#1f77b4', // Blue
    '#2ca02c', // Green
    '#bcbd22', // Yellow-Green
    '#d62728', // Red
    '#ff7f0e', // Orange
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#17becf', // Turquoise
    '#9467bd', // Purple
  ];

  createChainPerformanceChart(
    dataset: ChartDataset<'bar', { x: string | number | Date; y: number }[]>,
  ): Chart<'bar', { x: string | number | Date; y: number }[], unknown> {
    return new Chart<'bar', { x: string | number | Date; y: number }[]>('PerformanceChart', {
      type: 'bar',
      data: {
        datasets: [dataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
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
            type: 'category', // Ensuring it's a categorical axis
            alignToPixels: true,
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
            borderRadius: 4, // Adds rounded corners
            borderSkipped: false,
          },
        },
      },
    });
  }

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

  createStatisticsChart(
    rewardsChart: DateNumberPoint[],
    nDataSets: number,
    tensions: number[],
  ): LineChart {
    const dataSets: ChartDataset<'line', DateNumberPoint[]>[] = [];
    for (let i = 0; i < nDataSets; i++) {
      let chartColor = 'rgba(138, 128, 128)';
      if (i > 0) {
        chartColor = this.chartColors[i - 1];
      }

      dataSets.push({
        label: 'Total rewards earned (RSN)',
        data: rewardsChart,
        borderColor: chartColor,
        borderWidth: 4,
        pointBackgroundColor: chartColor,
        cubicInterpolationMode: 'default',
        tension: tensions[i],
        pointRadius: 0,
      });
    }

    return new Chart<'line', DateNumberPoint[]>('RewardChart', {
      type: 'line',
      data: {
        datasets: dataSets,
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
                return value as number;
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

  reduceChartData(
    data: DateNumberPoint[],
    targetPoints: number,
    adaptExtremes: boolean,
  ): DateNumberPoint[] {
    if (data.length == 0) {
      return [];
    }
    let points = data.slice();

    let remainingPoints = points.length - targetPoints;

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

    if (!adaptExtremes) {
      return points;
    }

    const timeValuesX = points.map((p) => p.x.getTime());
    const minTimeX = Math.min(...timeValuesX);
    const maxTimeX = Math.max(...timeValuesX);
    const timeRangeX = maxTimeX - minTimeX;

    const newPoints: DateNumberPoint[] = [];

    newPoints[0] = points[0];
    const valuesY = points.map((p) => p.y);
    const minY = Math.min(...valuesY);
    const maxY = Math.max(...valuesY);
    const rangeY = maxY - minY;

    let currentPoint = 0;

    for (let i = 1; i < points.length; i++) {
      const diff = points[i].y - points[i - 1].y;

      const timeDiff = points[i].x.getTime() - points[currentPoint].x.getTime();

      const dx = timeDiff / timeRangeX;
      const dy = diff / rangeY;

      const steepSlope = dx < 0.1 * dy || dy < 0.1 * dx;

      if (!steepSlope) {
        newPoints.push(points[i]);
        currentPoint = i;
      } else if (i == points.length - 1) {
        newPoints[newPoints.length - 1] = points[i];
      }
    }

    points = newPoints;
    if (points.length <= 1 && data.length > 1) {
      points = [data[0], data[data.length - 1]];
    }

    return points;
  }
}
