import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reward-chart',
  templateUrl: './reward.chart.component.html',
  styleUrls: ['./reward.chart.component.css'],
  encapsulation: ViewEncapsulation.None 
})
export class RewardChartComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.createChart();
  }

  public chart: any;

  createChart() {
    this.chart = new Chart("RewardChart", {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: "Total rewards earned",
            data: [ { x: new Date(2024, 3, 1), y: 10 },
              { x: new Date(2024, 3, 2), y: 20 },
              { x: new Date(2024, 3, 3), y: 30 },
              { x: new Date(2024, 3, 4), y: 30 },
              { x: new Date(2024, 3, ), y: 30 },
              { x: new Date(2024, 3, 4), y: 30 },
              { x: new Date(2024, 3, 4), y: 30 },
              { x: new Date(2024, 3, 5), y: 30 }
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
            }
          },
          x: {
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