import { ChainType } from '../service/chain.service';
import { ChartPoint } from './chart.point';

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
