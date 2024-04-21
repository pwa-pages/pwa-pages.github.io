import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'app-performance-chart',
  templateUrl: './performance.chart.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PerformanceChartComponent implements OnInit {

  @Input() chartData: any[];
  chart: Chart<"bar", any[][], unknown> | undefined;

  constructor() {
    this.chartData = [];

  }

  ngOnInit(): void {
    this.chart = this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && !changes['chartData'].firstChange) {
      this.updateChart();
    }
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

  private createDataSet(i: number): any {

    const chartColors: string[] = [
      '#1f77b4', // Blue
      '#ff7f0e', // Orange
      '#2ca02c', // Green
      '#d62728', // Red
      '#9467bd', // Purple
      '#8c564b', // Brown
      '#e377c2', // Pink
      '#7f7f7f', // Gray
      '#17becf',  // Turquoise
      '#bcbd22' // Yellow-Green
  ];

    var chartColor = chartColors[(i)%10];
    return {
      label: "",
      data: [
      ],
      borderColor: chartColor,
      backgroundColor: chartColor,
      pointBackgroundColor: chartColor
    };
  }

  updateChart(): void {
    if (this.chart) {

      //this.chart.data.datasets[0].data = this.reduceChartData(this.chartData[0].chart, 50);

      var cnt = this.chartData.length - this.chart.data.datasets.length;
      for (var i = 0; i < cnt; i++) {
        this.chart.data.datasets.push(
          this.createDataSet(i)
        );
      }

      for (var i = 0; i < this.chartData.length; i++) {
        this.chart.data.datasets[i].data = this.chartData[i].chart;  
        this.chart.data.datasets[i].label = 'Address: ' + this.chartData[i].addressForDisplay;
      }

      

      this.chart.update();

    }
  }


  createChart(): Chart<"bar", any[][], unknown> {
    return new Chart("PerformanceChart", {
      type: 'bar',
      data: {
        datasets: [
          this.createDataSet(9)
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            stacked: true,
            
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              callback: function (value) {
                return value as number / 1000;
              }
            }
          },
          x: {
            type: 'time',
            stacked: true,
            time: {
              unit: 'week',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            }
          }
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
            }
          },
          legend: {
            labels: {
              font: {
                size: 14,
              }
            }
          }
          ,
        }
      }
    });
  }
}