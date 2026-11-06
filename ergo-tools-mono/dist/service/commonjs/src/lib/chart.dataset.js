"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainPerfChartDataSet = exports.ChartDataSet = void 0;
class ChartDataSet {
    label;
    data;
    backgroundColor;
    pointBackgroundColor;
    borderColor;
    borderWidth;
    borderSkipped;
    constructor(chartColor) {
        this.label = '';
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
    }
}
exports.ChartDataSet = ChartDataSet;
class ChainPerfChartDataSet {
    label;
    data;
    backgroundColor;
    pointBackgroundColor;
    borderColor;
    borderWidth;
    borderSkipped;
    constructor(chartColor) {
        this.label = '';
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
    }
}
exports.ChainPerfChartDataSet = ChainPerfChartDataSet;
