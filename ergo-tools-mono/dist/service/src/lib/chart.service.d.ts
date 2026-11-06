import { ChainType } from "./chain.service";
import { DateNumberPoint } from "./constants";
import { Input } from "./input";
export declare class ChartService {
    getAddressCharts(inputs: Input[]): Promise<Record<string, {
        chainType: ChainType | null;
        charts: Record<number, number>;
    }>>;
    getAmountsByDate(inputs: Input[], period: string): Promise<DateNumberPoint[]>;
    private reduceData;
}
