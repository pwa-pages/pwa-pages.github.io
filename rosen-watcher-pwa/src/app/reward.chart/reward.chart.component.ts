import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation } from '@angular/core';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'app-reward-chart',
  templateUrl: './reward.chart.component.html',
  styleUrls: ['./reward.chart.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RewardChartComponent implements OnInit {

  @Input() chartData: any[];
  chart: Chart<"line", any[][], unknown> | undefined;

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

  calculateTriangleArea(p1: {x: Date, y: number}, p2: {x: Date, y: number}, p3: {x: Date, y: number}): number {
    return Math.abs((p1.x.getTime() * (p2.y - p3.y) + p2.x.getTime() * (p3.y - p1.y) + p3.x.getTime() * (p1.y - p2.y)) / 2);
  }


 updateChart(): void {
    if (this.chart) {
      this.chart.data.datasets[0].data =  this.reduceChartData(this.chartData, 15);
     
      this.chart.update();
    }
  }

  
  createChart(): Chart<"line", any[][], unknown> {
    return new Chart("RewardChart", {
      type: 'line',
      data: {
        datasets: [
          {
            label: "Total rewards earned (RSN)",
            data: [this.chartData
            ],
            borderColor: 'rgb(138, 128, 128)',
            backgroundColor: 'rgba(138, 128, 128, 0.2)',
            borderWidth: 4,
            pointBackgroundColor: 'rgb(138, 128, 128)',
            cubicInterpolationMode: 'default',
            tension: .4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
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
            time: {
              unit: 'day', 
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