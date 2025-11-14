

export function getAllChainTypes(): string[] {
  const raw = Object.values(ChainType) as (string | number)[];
  const unique = Array.from(new Set(raw));
  return unique.filter(v => typeof v === 'string' || typeof v === 'number') as ChainType[];
}

export function getCurrencyValues(): Currency[] {
  return Object.values(Currency);
}

export function getPermitAddressesByChainType(): Record<string, string | null> {
  return permitAddresses;
}

export function getPermitBulkAddressesByChainType(): Record<string, string | null> {
  return permitBulkAddresses;
}

export function getPermitTriggerAddressesByChainType(): Record<string, string | null> {
  return permitTriggerAddresses;
}

export function getChainTypeTokensByChainType(): Record<string, string | null> {
  return chainTypeTokens;
}

export function getChainTypeWatcherIdentifiersByChainType(): Record<string, string | null> {
  return chainTypeWatcherIdentifier;
}

export function getActivatedChainTypes(): string[] {
  return getActiveChainTypes();
}

export function getChainTypeForAddress(address?: string): string | null | undefined {
  return getChainType(address);
}

export function getRewardAddressForChainType(chainType: string): string | null | undefined {
  return (rewardAddresses as Record<string, string | null | undefined>)[chainType];
}

export interface IProcessEventService {
  processEvent(event: EvtPayload<object>): Promise<void>;
}

export type EvtPayload<T> = EventPayload<T>;
export type EvtSender = EventSender;

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
  static rs_DbName(): string {
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
  static rs_WatcherCollateralRSN(): number {
    return (globalThis as any).rs_WatcherCollateralRSN;
  }
  static rs_WatcherCollateralERG(): number {
    return (globalThis as any).rs_WatcherCollateralERG;
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

