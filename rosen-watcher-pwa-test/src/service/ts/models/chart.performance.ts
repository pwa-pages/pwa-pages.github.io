import type { ChainType } from "./chaintype";
import type { ChartPoint } from "./chart.point";

export class ChartPerformance {
  address: string;
  addressForDisplay: string;
  chart: ChartPoint[];
  chainType: ChainType | null;
  color: string;

  constructor(
    address: string,
    addressForDisplay: string,
    chart: ChartPoint[],
    color: string,
    chainType: ChainType | null,
  ) {
    this.address = address;
    this.addressForDisplay = addressForDisplay;
    this.chart = chart;
    this.chainType = chainType;
    this.color = color;
  }
}

export class ChainChartPerformance {
  address: string;
  addressForDisplay: string;
  chart: number;
  chainType: ChainType | null;
  color: string;

  constructor(
    address: string,
    addressForDisplay: string,
    chart: number,
    color: string,
    chainType: ChainType | null,
  ) {
    this.address = address;
    this.addressForDisplay = addressForDisplay;
    this.chart = chart;
    this.chainType = chainType;
    this.color = color;
  }
}
