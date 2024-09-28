import { ChartPoint } from './chart.point';

export class ChartDataSet {
  label: string;
  data: ChartPoint[];
  backgroundColor: string;
  pointBackgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderSkipped: boolean;

  constructor(chartColor: string) {
    this.label = '';
    this.data = [];
    this.backgroundColor = chartColor;
    this.pointBackgroundColor = chartColor;
    this.borderColor = chartColor;
    this.borderWidth = 0;
    this.borderSkipped = false;
  }
}
