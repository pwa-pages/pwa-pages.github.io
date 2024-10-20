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
    data = data.map(r => { return { x: r.x, y: r.y - firstPoint } });
  
    let remainingPoints = data.length - targetPoints;
    if (remainingPoints <= 0) {
      return data;
    }
  
    const points = data.slice();
  
    // Step 1: Dynamically calculate the threshold based on the range of x values (which are Dates)
    const timeValues = points.map(p => p.x.getTime()); // Convert Date to time in milliseconds
    const minTime = Math.min(...timeValues);
    const maxTime = Math.max(...timeValues);
    const timeRange = maxTime - minTime;
  
    const idealSpacing = timeRange / points.length; // Ideal spacing based on time range and number of points
    const threshold = idealSpacing * 0.1; // Set threshold to 10% of the ideal spacing (adjustable)
  
    // Step 2: Spread out points with close x (Date) values
    for (let i = 1; i < points.length; i++) {
      const timeDiff = points[i].x.getTime() - points[i - 1].x.getTime();
      if (timeDiff < threshold) {
        // If two x (Date) points are too close, spread them out by adjusting the current point's x value
        const newTime = points[i - 1].x.getTime() + threshold; // New time value
        points[i].x = new Date(newTime); // Set new Date based on adjusted time
      }
    }
  
    // Step 3: Reduce the points while keeping the closest points
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
  
    return points;
  }
  
}
