"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainChartPerformance = exports.ChartPerformance = void 0;
class ChartPerformance {
    address;
    addressForDisplay;
    chart;
    chainType;
    color;
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
exports.ChartPerformance = ChartPerformance;
class ChainChartPerformance {
    address;
    addressForDisplay;
    chart;
    chainType;
    color;
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
exports.ChainChartPerformance = ChainChartPerformance;
