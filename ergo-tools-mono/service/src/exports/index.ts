import { PermitTx } from './permit.tx';

export * from './address';
export * from './asset';
export * from './chainperf.chart.point';
export * from './chart.dataset';
export * from './chart.performance';
export * from './chart.point';
export * from './input'
export * from './permit.tx'
export * from './output'
export * from './token';
export * from './transaction';
export * from './watcher.info';

export function getAllChainTypes(): string[] {
  return (globalThis as any).getChainTypes();
}

export function getCurrencyValues(): string[] {
  return (globalThis as any).currencies;
}

export function getPermitAddressesByChainType(): Record<string, string | null> {
  return (globalThis as any).permitAddresses;
}

export function getPermitBulkAddressesByChainType(): Record<string, string | null> {
  return (globalThis as any).permitBulkAddresses;
}

export function getPermitTriggerAddressesByChainType(): Record<string, string | null> {
  return (globalThis as any).permitTriggerAddresses;
}

export function getChainTypeTokensByChainType(): Record<string, string | null> {
  return (globalThis as any).chainTypeTokens;
}

export function getChainTypeWatcherIdentifiersByChainType(): Record<string, string | null> {
  return (globalThis as any).chainTypeWatcherIdentifier;
}

export function getActivatedChainTypes(): string[] {
  return (globalThis as any).getActiveChainTypes();
}

export function getChainTypeForAddress(address?: string): string | null | undefined {
  return (globalThis as any).getChainType(address);
}

export function getRewardAddressForChainType(chainType: string): string | null | undefined {
  return ((globalThis as any).rewardAddresses as Record<string, string | null | undefined>)[chainType];
}

export interface IProcessEventService {
  processEvent(event: EvtPayload<object>): Promise<void>;
}

export interface EvtPayload<T> {
  type: string;
  data?: T;
}

export interface EvtSender {
  sendEvent<T>(event: EvtPayload<T>): Promise<void>;
}

export function createProcessEvtService(eventSender: EvtSender): IProcessEventService {
  return (globalThis as any).CreateProcessEventService(eventSender);
}


export class ErgSettings {
  static rs_ErgoExplorerHost(): string {
    return (globalThis as any).rs_ErgoExplorerHost;
  }
  static rs_ErgoNodeHost(): string {
    return (globalThis as any).rs_ErgoNodeHost;
  }
  static rs_dbName(): string {
    return (globalThis as any).rs_DbName;
  }
  static rs_DbVersion(): number {
    return (globalThis as any).rs_DbVersion;
  }
  static rs_InputsStoreName(): string {
    return (globalThis as any).rs_InputsStoreName;
  }
  static rs_PerfTxStoreName(): string {
    return (globalThis as any).rs_PerfTxStoreName;
  }
  static rs_PermitTxStoreName(): string {
    return (globalThis as any).rs_PermitTxStoreName;
  }
  static rs_ActivePermitTxStoreName(): string {
    return (globalThis as any).rs_ActivePermitTxStoreName;
  }
  static rs_DownloadStatusStoreName(): string {
    return (globalThis as any).rs_DownloadStatusStoreName;
  }
  static rs_OpenBoxesStoreName(): string {
    return (globalThis as any).rs_OpenBoxesStoreName;
  }
  static rs_AddressDataStoreName(): string {
    return (globalThis as any).rs_AddressDataStoreName;
  }
  static rs_InitialNDownloads(): number {
    return (globalThis as any).rs_InitialNDownloads;
  }
  static rs_FullDownloadsBatchSize(): number {
    return (globalThis as any).rs_FullDownloadsBatchSize;
  }
  static rs_PerfInitialNDownloads(): number {
    return (globalThis as any).rs_PerfInitialNDownloads;
  }
  static rs_PerfFullDownloadsBatchSize(): number {
    return (globalThis as any).rs_PerfFullDownloadsBatchSize;
  }
  static rs_StartFrom(): Date {
    return (globalThis as any).rs_StartFrom;
  }
  static rs_Input_Key(): string[] {
    return (globalThis as any).rs_Input_Key;
  }
  static rs_Permit_Key(): string {
    return (globalThis as any).rs_Permit_Key;
  }
  static rs_ActivePermit_Key(): string {
    return (globalThis as any).rs_ActivePermit_Key;
  }
  static rs_PerfTx_Key(): string {
    return (globalThis as any).rs_PerfTx_Key;
  }
  static rs_Address_Key(): string {
    return (globalThis as any).rs_Address_Key;
  }
  static rs_PermitCost(): number {
    return (globalThis as any).rs_PermitCost;
  }
  static rs_WatcherCollateralRSN(chainType: string): number {
    return (globalThis as any).rs_WatcherCollateralRSN(chainType);
  }
  static rs_WatcherCollateralERG(chainType: string): number {
    return (globalThis as any).rs_WatcherCollateralERG(chainType);
  }
  static rs_RSNTokenId(): string {
    return (globalThis as any).rs_RSNTokenId;
  }
  static rs_eRSNTokenId(): string {
    return (globalThis as any).rs_eRSNTokenId;
  }
  static rs_TokenIdMap(): Record<string, string> {
    return (globalThis as any).rs_TokenIdMap;
  }
  static rs_RSNDecimals(): number {
    return (globalThis as any).rs_RSNDecimals;
  }
}

export interface ActivePermitsDataService {
  getAdressPermits(
    activeOnly: boolean,
    month: number,
    year: number
  ): Promise<PermitTx[]>
}


export interface IDownloadService<SERVICE> {
  downloadForAddress<T>(
    address: string,
    useNode: boolean,
    callback?: () => Promise<T>,
  ): Promise<T[]>;
  getDataService(): SERVICE;
}

export function GetDownloadService<SERVICE> (maxDownloadDateDifference: number): IDownloadService<SERVICE>{
  return (globalThis as any).CreateActivePermitsDownloadService(maxDownloadDateDifference, null);
}



