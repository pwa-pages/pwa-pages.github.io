import { ChainType } from "./chain.service";
export declare enum EventType {
    StartFullDownload = "StartFullDownload",
    EndFullDownload = "EndFullDownload",
    RefreshInputs = "RefreshInputs",
    InputsChanged = "InputsChanged",
    PerfChartChanged = "PerfChartChanged",
    SwipeActivated = "SwipeActivated",
    SwipeDeActivated = "SwipeDeActivated",
    SwipeVertical = "SwipeVertical",
    StatisticsScreenLoaded = "StatisticsScreenLoaded",
    MyWatchersScreenLoaded = "MyWatchersScreenLoaded",
    ReportsRequested = "ReportsRequested",
    RequestInputsDownload = "RequestInputsDownload",
    WatchersScreenLoaded = "WatchersScreenLoaded",
    SettingsScreenLoaded = "SettingsScreenLoaded",
    PerformanceScreenLoaded = "PerformanceScreenLoaded",
    AddressChartChanged = "AddressChartChanged",
    WindowResized = "WindowResized",
    VersionUpdated = "VersionUpdated",
    WatchersStatsChanged = "WatchersStatsChanged",
    PermitsStatsChanged = "PermitsStatsChanged",
    ChainPerformanceChartsChanged = "ChainPerformanceChartsChanged",
    PerformanceChartsChanged = "PerformanceChartsChanged",
    StatisticsChartChanged = "StatisticsChartChanged",
    PermitsChanged = "PermitsChanged",
    RefreshPermits = "RefreshPermits",
    AddressPermitsDownloaded = "AddressPermitsDownloaded",
    ReportsChanged = "ReportsChanged"
}
export declare class Address {
    address: string;
    Address: string;
    active: boolean;
    chainType: string | null | undefined;
    smallAddressForDisplay: string;
    largeAddressForDisplay: string;
    ownAddress?: boolean;
    constructor(address: string, chainType: string | null | undefined, active?: boolean, ownAddress?: boolean);
}
export declare class Asset {
    amount: number;
    name: string;
    decimals: number;
    type: string;
    tokenId: string | null;
    constructor(amount: number, name: string, decimals: number, type: string, tokenId: string | null);
}
export declare class Input {
    outputAddress: string;
    inputDate: Date;
    boxId: string;
    assets: Asset[];
    outputCreatedAt: number;
    address: string;
    accumulatedAmount?: number;
    amount?: number;
    chainType?: string | null;
    constructor(inputDate: Date, address: string, outputCreatedAt: number, assets: Asset[], outputAddress: string, boxId: string, accumulatedAmount?: number, amount?: number, chainType?: string | null);
}
export declare class Token {
    tokenId: string;
    amount: number;
    decimals: number;
    name: string;
    tokenType: string;
    constructor(tokenId: string, amount: number, decimals: number, name: string, tokenType: string);
}
export declare class WatcherInfo {
    tokens: Token[];
    constructor(tokens: Token[]);
}
export declare class MyWatchersStats {
    activePermitCount: number | undefined;
    permitCount: number | undefined;
    wid: string | undefined;
    chainType: string | undefined;
    address: Address | undefined;
}
export declare class WatcherPerformanceAddressStat {
    address: Address | undefined;
    reports: number | undefined;
}
export declare class WatchersPerformanceStats {
    watcherPerformances: Record<string, Record<string, WatcherPerformanceAddressStat[]>> | undefined;
}
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
export declare class ChartPoint {
    x: Date;
    y: number;
    constructor(x: Date, y: number);
}
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
export interface MessageEventData {
    type: string;
    data: string;
}
export interface TransactionItem {
    timestamp: string;
    inputs: Input[];
    outputs: Output[];
    id: string;
}
export interface FetchTransactionsResponse {
    transactions: TransactionItem[];
    items: TransactionItem[];
    total: number;
}
export interface DownloadStatus {
    address: string;
    Address: string;
    status: string;
    lastDownloadDate: Date | undefined;
}
export interface PerfTx {
    id: string;
    timestamp: string;
    chainType?: string;
    amount: number;
    decimals?: number;
}
export interface OpenBoxes {
    address: string;
    openBoxesJson: string;
}
export interface PermitTx {
    id: string;
    date: Date;
    boxId: string;
    assets: Asset[];
    address: string;
    chainType?: string;
    wid: string;
    transactionId: string;
}
export interface PermitInfo {
    lockedRSN: number;
    activeLockedRSN: number;
    address: string;
    wid: string;
    chainType: ChainType;
}
export interface DbInput {
    outputAddress: string;
    inputDate: Date;
    boxId: string;
    assets: Asset[];
    address?: string;
    chainType?: string;
}
export interface Output {
    boxId: string;
    outputDate: Date;
    assets: Asset[];
    address: string;
}
