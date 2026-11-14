import { ChainType, getChainTypes } from "./chain.service";
import { rs_PermitCost, rs_WatcherCollateralERG, rs_WatcherCollateralRSN, Currency } from "./constants";

export enum EventType {
  StartFullDownload = 'StartFullDownload',
  EndFullDownload = 'EndFullDownload',
  RefreshInputs = 'RefreshInputs',
  InputsChanged = 'InputsChanged',
  PerfChartChanged = 'PerfChartChanged',
  SwipeActivated = 'SwipeActivated',
  SwipeDeActivated = 'SwipeDeActivated',
  SwipeVertical = 'SwipeVertical',
  StatisticsScreenLoaded = 'StatisticsScreenLoaded',
  MyWatchersScreenLoaded = 'MyWatchersScreenLoaded',
  ReportsRequested = 'ReportsRequested',
  RequestInputsDownload = 'RequestInputsDownload',
  WatchersScreenLoaded = 'WatchersScreenLoaded',
  SettingsScreenLoaded = 'SettingsScreenLoaded',
  PerformanceScreenLoaded = 'PerformanceScreenLoaded',
  AddressChartChanged = 'AddressChartChanged',
  WindowResized = 'WindowResized',
  VersionUpdated = 'VersionUpdated',
  WatchersStatsChanged = 'WatchersStatsChanged',
  PermitsStatsChanged = 'PermitsStatsChanged',
  ChainPerformanceChartsChanged = 'ChainPerformanceChartsChanged',
  PerformanceChartsChanged = 'PerformanceChartsChanged',
  StatisticsChartChanged = 'StatisticsChartChanged',
  PermitsChanged = 'PermitsChanged',
  RefreshPermits = 'RefreshPermits',
  AddressPermitsDownloaded = 'AddressPermitsDownloaded',
  ReportsChanged = 'ReportsChanged'
}

export class Address {
    address: string;
    Address: string;
    active = true;
    chainType: string | null | undefined;
    smallAddressForDisplay: string;
    largeAddressForDisplay: string;
    ownAddress?: boolean;

    constructor(
        address: string,
        chainType: string | null | undefined,
        active = true,
        ownAddress: boolean = false,
    ) {
        this.address = address;
        this.Address = address;
        this.smallAddressForDisplay = address.substring(0, 6) + '...';
        this.largeAddressForDisplay =
            address.substring(0, 6) +
            '...' +
            address.substring(address.length - 6, address.length);

        this.chainType = chainType;
        this.active = active;
        this.ownAddress = ownAddress;
    }
}

export class Asset {
    amount: number;
    name: string;
    decimals: number;
    type: string;
    tokenId: string | null;

    constructor(
        amount: number,
        name: string,
        decimals: number,
        type: string,
        tokenId: string | null,
    ) {
        this.amount = amount;
        this.name = name;
        this.decimals = decimals;
        this.type = type;
        this.tokenId = tokenId
    }
}



export class Input {
    outputAddress: string;
    inputDate: Date;
    boxId: string;
    assets: Asset[];
    outputCreatedAt: number;
    address: string;
    accumulatedAmount?: number;
    amount?: number;
    chainType?: string | null;

    constructor(
        inputDate: Date,
        address: string,
        outputCreatedAt: number,
        assets: Asset[],
        outputAddress: string,
        boxId: string,
        accumulatedAmount?: number,
        amount?: number,
        chainType?: string | null,
    ) {
        this.outputAddress = outputAddress;
        this.inputDate = inputDate;
        this.assets = assets;
        this.boxId = boxId;
        this.outputCreatedAt = outputCreatedAt;
        this.address = address;
        this.accumulatedAmount = accumulatedAmount;
        this.amount = amount;
        this.chainType = chainType;
    }
}

export class Token {
    constructor(
        public tokenId: string,
        public amount: number,
        public decimals: number,
        public name: string,
        public tokenType: string,
    ) { }
}



export class WatcherInfo {
    constructor(public tokens: Token[]) { }
}

export class MyWatchersStats {
    activePermitCount: number | undefined;
    permitCount: number | undefined;
    wid: string | undefined;
    chainType: string | undefined;
    address: Address | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class WatcherPerformanceAddressStat {
    address: Address | undefined;
    reports: number | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class WatchersPerformanceStats {
    watcherPerformances:
        | Record<string, Record<string, WatcherPerformanceAddressStat[]>>
        | undefined;
}

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

export class ChainPerfChartDataSet {
  label: string;
  data: { x: string; y: number }[];
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

export class ChartPoint {
  x: Date;
  y: number;

  constructor(x: Date, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class ChartPerformance {
  address: string;
  addressForDisplay: string;
  chart: ChartPoint[];
  chainType: string | null;
  color: string;

  constructor(
    address: string,
    addressForDisplay: string,
    chart: ChartPoint[],
    color: string,
    chainType: string | null,
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
  chainType: string | null;
  color: string;

  constructor(
    address: string,
    addressForDisplay: string,
    chart: number,
    color: string,
    chainType: string | null,
  ) {
    this.address = address;
    this.addressForDisplay = addressForDisplay;
    this.chart = chart;
    this.chainType = chainType;
    this.color = color;
  }
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface PermitInfo {
  lockedRSN: number;
  activeLockedRSN: number;
  address: string;
  wid: string;
  chainType: ChainType;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DbInput {
  outputAddress: string;
  inputDate: Date;
  boxId: string;
  assets: Asset[];
  address?: string;
  chainType?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Output {
  boxId: string;
  outputDate: Date;
  assets: Asset[];
  address: string;
}

export function createChainNumber(): Record<string, number | undefined> {
  return Object.fromEntries(
    getChainTypes().map((key) => [key, undefined]),
  ) as Record<string, number | undefined>;
}

export class WatchersAmounts {
  ergCollateral: number | undefined;
  permitValue: number | undefined;
  rsnCollateral: number | undefined;
  totalLocked: number | undefined;
  totalLockedERG: number | undefined;
  totalLockedRSN: number | undefined;
  watcherValue: number | undefined;
}

export class WatchersStats {
  activePermitCount = createChainNumber();
  bulkPermitCount = createChainNumber();
  chainLockedERG = createChainNumber();
  chainLockedRSN = createChainNumber();
  chainPermitCount = createChainNumber();
  chainWatcherCount = createChainNumber();
  permitCost = rs_PermitCost;
  totalActivePermitCount: number | undefined;
  totalLockedERG: number | undefined;
  totalLockedRSN: number | undefined;
  totalPermitCount: number | undefined;
  totalWatcherCount: number | undefined;
  triggerPermitCount = createChainNumber();
  watcherCollateralERG = rs_WatcherCollateralERG('Ergo');
  watcherCollateralRSN = rs_WatcherCollateralRSN('Ergo');

  watchersAmountsPerCurrency: Record<string, WatchersAmounts> =
    Object.fromEntries(
      Object.values(Currency).map((currency) => [
        currency,
        new WatchersAmounts(),
      ]),
    ) as Record<string, WatchersAmounts>;
}
