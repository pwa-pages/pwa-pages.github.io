import type { ChartPoint } from './chart.point';
export declare class ChartDataSet {
    label: string;
    data: ChartPoint[];
    backgroundColor: string;
    pointBackgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderSkipped: boolean;
    constructor(chartColor: string);
}
export declare class ChainPerfChartDataSet {
    label: string;
    data: {
        x: string;
        y: number;
    }[];
    backgroundColor: string;
    pointBackgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderSkipped: boolean;
    constructor(chartColor: string);
}
