import { Injectable } from '@angular/core';
import Chart, { ChartDataset, TooltipItem } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { ChartPerformance } from '../../service/ts/models/chart.performance';
import { ChartPoint } from '../../service/ts/models/chart.point';
import { ChartDataSet } from '../../service/ts/models/chart.dataset';

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
    canvasElement: HTMLCanvasElement,
  ): Chart<'bar', { x: string | number | Date; y: number }[], unknown> {
    return new Chart<'bar', { x: string | number | Date; y: number }[]>(
      canvasElement,
      {
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
                    value.y.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })
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
      },
    );
  }

  createPerformanceChart(
    performanceCharts: ChartPerformance[],
    canvasElement: HTMLCanvasElement,
    accentChartColor?: string,
  ): Chart<'bar', { x: string | number | Date; y: number }[], unknown> {
    const dataSets = this.CreatePerformanceDataSets(performanceCharts);
    return new Chart<'bar', { x: string | number | Date; y: number }[]>(
      canvasElement,
      {
        type: 'bar',
        data: {
          datasets: dataSets,
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
                color: accentChartColor ?? 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: accentChartColor ?? 'rgba(0, 0, 0, 0.7)',
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
                color: accentChartColor ?? 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: accentChartColor ?? 'rgba(0, 0, 0, 0.7)',
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
                    value.y.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })
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
      },
    );
  }

  public convertPerformanceCharts(
    performanceCharts: ChartPerformance[],
    performanceChart:
      | Chart<'bar', { x: string | number | Date; y: number }[], unknown>
      | undefined,
    accentChartColor?: string,
  ) {
    const dataSets = this.CreatePerformanceDataSets(performanceCharts);

    if (performanceCharts.length != performanceChart?.data.datasets.length) {
      performanceChart!.data.datasets = dataSets;
    } else {
      for (let i = 0; i < performanceCharts.length; i++) {
        performanceChart.data.datasets[i].data = dataSets[i].data;
      }
    }

    if (accentChartColor) {
      if (
        performanceChart &&
        performanceChart.options &&
        performanceChart.options.scales &&
        performanceChart.options.scales['y'] &&
        performanceChart.options.scales['x']
      ) {
        performanceChart.options.scales['y'].grid = {
          ...performanceChart.options.scales['y'].grid,
          color: accentChartColor,
        };
        performanceChart.options.scales['y'].ticks = {
          ...performanceChart.options.scales['y'].ticks,
          color: accentChartColor,
        };
        performanceChart.options.scales['x'].grid = {
          ...performanceChart.options.scales['x'].grid,
          color: accentChartColor,
        };
        performanceChart.options.scales['x'].ticks = {
          ...performanceChart.options.scales['x'].ticks,
          color: accentChartColor,
        };
      }
    }
    performanceChart!.update();
  }

  private createDataSet(i: number): ChartDataSet {
    const chartColor = this.chartColors[i % 10];
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

  public CreatePerformanceDataSets(performanceCharts: ChartPerformance[]) {
    const dataSets = [];
    const cnt = performanceCharts.length;
    for (let i = 0; i < cnt; i++) {
      dataSets.push(this.createDataSet(i));
    }

    for (let i = 0; i < performanceCharts.length; i++) {
      dataSets[i].data = performanceCharts[i].chart;
      dataSets[i].label = 'Address: ' + performanceCharts[i].addressForDisplay;
    }
    return dataSets;
  }

  public async getPerformanceChart(
    addressCharts: Record<
      string,
      { chainType: ChainType | null; charts: Record<number, number> }
    >,
  ): Promise<ChartPerformance[]> {
    let performanceChart: ChartPerformance[] = [];

    performanceChart = [];

    for (const key in addressCharts) {
      if (Object.prototype.hasOwnProperty.call(addressCharts, key)) {
        const chart: ChartPoint[] = [];
        for (const ckey in addressCharts[key].charts) {
          chart.push({
            x: new Date(Number(ckey)),
            y: addressCharts[key].charts[ckey],
          });
        }
        const addressForDisplay =
          key.substring(0, 6) +
          '...' +
          key.substring(key.length - 6, key.length);
        performanceChart.push({
          address: key,
          addressForDisplay: addressForDisplay,
          chart: chart,
          chainType: addressCharts[key].chainType,
          color: '',
        });
      }
    }

    performanceChart.sort((a: ChartPerformance, b: ChartPerformance) =>
      (a.chainType == null ? '' : a.chainType).localeCompare(
        b.chainType == null ? '' : b.chainType,
      ),
    );

    console.log('done retrieving chart from database');

    return performanceChart.map((c: ChartPerformance, index: number) => ({
      ...c,
      color: this.chartColors[index % this.chartColors.length],
    }));
  }

  createStatisticsChart(
    canvasElement: HTMLCanvasElement,
    rewardsChart: DateNumberPoint[],
    nDataSets: number,
    tensions: number[],
    chartTitle: string,
    chartColor?: string,
    accentChartColor?: string,
  ): LineChart {
    const dataSets: ChartDataset<'line', DateNumberPoint[]>[] = [];
    for (let i = 0; i < nDataSets; i++) {
      let cColor = accentChartColor ?? 'rgba(138, 128, 128)';
      if (i > 0) {
        cColor = this.chartColors[i - 1];
      }

      dataSets.push({
        label: chartTitle,
        data: rewardsChart,
        borderColor: cColor,
        backgroundColor: accentChartColor ?? 'rgba(0, 0, 0, 0.1)',
        borderWidth: 4,
        pointBackgroundColor: cColor,
        cubicInterpolationMode: 'default',
        tension: tensions[i],
        pointRadius: 0,
      });
    }

    return new Chart<'line', DateNumberPoint[]>(canvasElement, {
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
              color: accentChartColor ?? 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: chartColor ?? 'rgba(0, 0, 0, 0.7)',
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
              color: accentChartColor ?? 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: chartColor ?? 'rgba(0, 0, 0, 0.7)',
            },
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: chartColor ?? 'rgba(0, 0, 0, 0.7)',
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
              color: chartColor ?? 'rgba(0, 0, 0, 0.7)',
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  }

  updateStatisticsChart(
    chart: LineChart,
    newTitle: string,
    chartColor?: string,
    accentChartColor?: string,
  ): void {
    chart.data.datasets.forEach((dataset, i) => {
      dataset.label = newTitle;
      let cColor = chartColor ?? 'rgba(138, 128, 128)';
      if (i > 0) {
        cColor = this.chartColors[i - 1];
      }
      (dataset as ChartDataset<'line', DateNumberPoint[]>).borderColor = cColor;
      (
        dataset as ChartDataset<'line', DateNumberPoint[]>
      ).pointBackgroundColor = cColor;
      (dataset as ChartDataset<'line', DateNumberPoint[]>).backgroundColor =
        accentChartColor ?? 'rgba(0, 0, 0, 0.1)';
    });

    if (
      chart.options.scales &&
      chart.options.scales['y'] &&
      typeof chart.options.scales['y'] === 'object'
    ) {
      chart.options.scales['y'].grid = {
        ...chart.options.scales['y'].grid,
        color: accentChartColor ?? 'rgba(0, 0, 0, 0.1)',
      };
      chart.options.scales['y'].ticks = {
        ...chart.options.scales['y'].ticks,
        color: chartColor ?? 'rgba(0, 0, 0, 0.7)',
      };
    }
    if (
      chart.options.scales &&
      chart.options.scales['x'] &&
      typeof chart.options.scales['x'] === 'object'
    ) {
      chart.options.scales['x'].grid = {
        ...chart.options.scales['x'].grid,
        color: accentChartColor ?? 'rgba(0, 0, 0, 0.1)',
      };
      chart.options.scales['x'].ticks = {
        ...chart.options.scales['x'].ticks,
        color: chartColor ?? 'rgba(0, 0, 0, 0.7)',
      };
    }
    if (
      chart.options.plugins &&
      chart.options.plugins.legend &&
      typeof chart.options.plugins.legend === 'object'
    ) {
      chart.options.plugins.legend.labels = {
        ...chart.options.plugins.legend.labels,
        color: chartColor ?? 'rgba(0, 0, 0, 0.7)',
      };
    }
    if (
      chart.options.plugins &&
      chart.options.plugins.tooltip &&
      typeof chart.options.plugins.tooltip === 'object'
    ) {
      chart.options.plugins.tooltip.backgroundColor =
        chartColor ?? 'rgba(0, 0, 0, 0.7)';
    }

    chart.update();
  }

  calculateTriangleArea(
    p1: DateNumberPoint,
    p2: DateNumberPoint,
    p3: DateNumberPoint,
  ): number {
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
        const area = this.calculateTriangleArea(
          points[i - 1],
          points[i],
          points[i + 1],
        );
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
