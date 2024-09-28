import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
let ChartService = class ChartService {
    createPerformanceChart(datasets) {
        return new Chart('PerformanceChart', {
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
                            callback: function (value) {
                                return value.toLocaleString('en-US', {
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
                            label: function (context) {
                                const value = context.raw;
                                return (context.dataset.label +
                                    ': ' +
                                    value.y.toLocaleString('en-US', { minimumFractionDigits: 2 }));
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
    createStatisticsChart(rewardsChart) {
        return new Chart('RewardChart', {
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
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                            callback: function (value) {
                                return value / 1000;
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
    calculateTriangleArea(p1, p2, p3) {
        return Math.abs((p1.x.getTime() * (p2.y - p3.y) +
            p2.x.getTime() * (p3.y - p1.y) +
            p3.x.getTime() * (p1.y - p2.y)) /
            2);
    }
    reduceChartData(data, targetPoints) {
        let remainingPoints = data.length - targetPoints;
        if (remainingPoints <= 0) {
            return data;
        }
        const points = data.slice();
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
            }
            else {
                break;
            }
        }
        return points;
    }
};
ChartService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], ChartService);
export { ChartService };
//# sourceMappingURL=chart.service.js.map