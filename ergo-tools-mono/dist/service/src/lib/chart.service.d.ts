declare class ChartService {
    getAddressCharts(inputs: Input[]): Promise<Record<string, {
        chainType: ChainType | null;
        charts: Record<number, number>;
    }>>;
    getAmountsByDate(inputs: Input[], period: Period): Promise<DateNumberPoint[]>;
    private reduceData;
}
