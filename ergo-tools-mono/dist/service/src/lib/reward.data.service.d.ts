import { ChartService } from "./chart.service";
import { IStorageService } from "./constants";
import { DataService } from "./data.service";
import { DbInput, TransactionItem, Input } from "./models";
import { EventSender } from "./process.event.service";
export declare class RewardDataService extends DataService<DbInput> {
    private chartService;
    private eventSender;
    getData(): Promise<DbInput[] | null>;
    getExistingData(transaction: TransactionItem, address: string): Promise<DbInput | null>;
    constructor(db: IStorageService, chartService: ChartService, eventSender: EventSender);
    getDataType(): string;
    private getWatcherInputs;
    addData(address: string, transactions: TransactionItem[]): Promise<void>;
    private getDataByBoxId;
    getSortedInputs(): Promise<Input[]>;
}
