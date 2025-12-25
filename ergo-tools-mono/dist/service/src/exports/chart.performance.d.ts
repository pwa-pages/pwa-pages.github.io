import type { ChartPoint } from './chart.point';
export declare class ChartPerformance {
    address: string;
    addressForDisplay: string;
    chart: ChartPoint[];
    chainType: string | null;
    color: string;
    constructor(address: string, addressForDisplay: string, chart: ChartPoint[], color: string, chainType: string | null);
}
export declare class ChainChartPerformance {
    address: string;
    addressForDisplay: string;
    chart: number;
    chainType: string | null;
    color: string;
    constructor(address: string, addressForDisplay: string, chart: number, color: string, chainType: string | null);
}
