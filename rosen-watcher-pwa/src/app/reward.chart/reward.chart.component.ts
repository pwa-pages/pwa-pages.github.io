import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
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

  updateChart(): void {
    if (this.chart) {
      this.chart.data.datasets[0].data = this.chartData;
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
            borderWidth: 2,
            pointBackgroundColor: 'rgb(138, 128, 128)',
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
              unit: 'day', // Set the time unit to 'day'
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