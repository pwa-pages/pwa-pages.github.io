export function getAllChainTypes(): string[] {
  const raw = Object.values(ChainType) as (string | number)[];
  const unique = Array.from(new Set(raw));
  return unique.filter(v => typeof v === 'string' || typeof v === 'number') as ChainType[];
}

export function getActivatedChainTypes(): string[] {
  return getActiveChainTypes();
}

export function getChainTypeForAddress(address?: string): string | null | undefined {
  return getChainType(address);
}

export function getRewardAddressForChainType(chainType: string): string | null | undefined {
  return rewardAddresses[chainType as ChainType];
}

export interface IProcessEventService {
  processEvent(event: EvtPayload<object>): Promise<void>;
}

export type EvtPayload<T> = EventPayload<T>;
export type EvtSender = EventSender;

export function createProcessEvtService(eventSender: EvtSender): IProcessEventService {
  return new ProcessEventService(
    eventSender
  );
}
export class ErgConstants {
  static rs_ErgoExplorerHost: string = rs_ErgoExplorerHost;
  static rs_ErgoNodeHost: string = rs_ErgoNodeHost;
  static rs_DbName: string = rs_DbName;
  static rs_DbVersion: number = rs_DbVersion;
  static rs_InputsStoreName: string = rs_InputsStoreName;
  static rs_PerfTxStoreName: string = rs_PerfTxStoreName;
  static rs_PermitTxStoreName: string = rs_PermitTxStoreName;
  static rs_ActivePermitTxStoreName: string = rs_ActivePermitTxStoreName;
  static rs_DownloadStatusStoreName: string = rs_DownloadStatusStoreName;
  static rs_OpenBoxesStoreName: string = rs_OpenBoxesStoreName;
  static rs_AddressDataStoreName: string = rs_AddressDataStoreName;
  static rs_InitialNDownloads: number = rs_InitialNDownloads;
  static rs_FullDownloadsBatchSize: number = rs_FullDownloadsBatchSize;
  static rs_PerfInitialNDownloads: number = rs_PerfInitialNDownloads;
  static rs_PerfFullDownloadsBatchSize: number = rs_PerfFullDownloadsBatchSize;
  static rs_StartFrom: Date = rs_StartFrom;
  static rs_Input_Key: string[] = rs_Input_Key;
  static rs_Permit_Key: string = rs_Permit_Key;
  static rs_ActivePermit_Key: string = rs_ActivePermit_Key;
  static rs_PerfTx_Key: string = rs_PerfTx_Key;
  static rs_Address_Key: string = rs_Address_Key;
  static rs_PermitCost: number = rs_PermitCost;
  static rs_WatcherCollateralRSN: number = rs_WatcherCollateralRSN;
  static rs_WatcherCollateralERG: number = rs_WatcherCollateralERG;
}

