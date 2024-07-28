import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { EventService, EventType } from '../service/event.service';
import { DataService } from '../service/data.service';
import { FeatureService } from '../service/featureservice';
import { SwipeService } from '../service/swipe.service';
import { BaseWatcherComponent } from '../basewatchercomponent';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';

@Component({
  selector: 'performance',
  templateUrl: './performance.html'
})


export class Performance extends BaseWatcherComponent implements OnInit {
  readonly chartColors: string[] = [
    '#1f77b4', // Blue
    '#2ca02c', // Green
    '#bcbd22', // Yellow-Green
    '#d62728', // Red
    '#ff7f0e', // Orange
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#17becf',  // Turquoise
    '#9467bd', // Purple

  ];
  data: string;
  performanceChart: any[];
  addresses: string[];
  noAddresses: boolean = false;
  addressesForDisplay: any[];

  showPermitsLink: boolean = false;
  chart: Chart<"bar", any[][], unknown> | undefined;

  constructor(router: Router, private dataService: DataService, featureService: FeatureService, eventService: EventService, swipeService: SwipeService) {

    super(eventService, featureService, swipeService);
    this.data = "";
    this.addresses = [];
    this.performanceChart = [];
    this.addressesForDisplay = [];
  }

  async retrieveData(): Promise<void> {
    this.performanceChart = await this.getPerformanceChart();
  }

  swipeRight(): void {
    var me = this;
    this.swipeService.swipe('right', '/statistics');
  }


  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    var me = this;
    this.swipeService.swipeDetect('/statistics');

    this.showPermitsLink = this.featureService.hasPermitScreen();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
    });

    await this.retrieveData();
    this.updateChart();


  }

  reduceChartData(data: any[], targetPoints: number): any[] {
    let remainingPoints = data.length - targetPoints;
    if (remainingPoints <= 0) {
      return data;
    }

    let points = data.slice();

    while (remainingPoints > 0) {
      let minArea = Infinity;
      let indexToRemove = -1;


      for (let i = 1; i < points.length - 1; i++) {
        let area = this.calculateTriangleArea(points[i - 1], points[i], points[i + 1]);
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

  calculateTriangleArea(p1: { x: Date, y: number }, p2: { x: Date, y: number }, p3: { x: Date, y: number }): number {
    return Math.abs((p1.x.getTime() * (p2.y - p3.y) + p2.x.getTime() * (p3.y - p1.y) + p3.x.getTime() * (p1.y - p2.y)) / 2);
  }

  private async getPerformanceChart(): Promise<any[]> {

    var chart = await this.dataService.getPerformanceChart()

    return chart.map((c, index) => ({
      ...c,
      color: this.chartColors[index % this.chartColors.length]
    }));
  }

  private createDataSet(i: number): any {



    var chartColor = this.chartColors[(i) % 10];
    return {
      label: "",
      data: [
      ],
      backgroundColor: chartColor,
      pointBackgroundColor: chartColor,
      borderColor: chartColor,
      borderWidth: 0,
      borderSkipped: false
    };
  }

  updateChart(): void {
    if (!this.chart) {
      var dataSets = [];
      var cnt = this.performanceChart.length;
      for (var i = 0; i < cnt; i++) {
        dataSets.push(
          this.createDataSet(i)
        );
      }

      for (var i = 0; i < this.performanceChart.length; i++) {
        dataSets[i].data = this.performanceChart[i].chart;
      }

      this.createChart(dataSets);
    }


  }


  createChart(datasets: any[]): Chart<"bar", any[][], unknown> {
    return new Chart("PerformanceChart", {
      type: 'bar',
      data: {
        datasets: datasets
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
              callback: function (value) {
                value = value as number;
                return value.toLocaleString('en-US', { minimumFractionDigits: 0 });
              }
            }
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
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
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
              label: function (context) {
                let value = context.raw as any;
                return context.dataset.label + ': ' + value.y.toLocaleString('en-US', { minimumFractionDigits: 2 });
              }
            }
          }
          ,
        },
        elements: {
          bar: {
            borderWidth: 0,
            borderRadius: 0,
            borderSkipped: false
          }
        }
      }
    });
  }
  title = 'rosen-watcher-pwa';
}
