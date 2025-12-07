export declare function getAllChainTypes(): string[];
export declare function getCurrencyValues(): string[];
export declare function getPermitAddressesByChainType(): Record<string, string | null>;
export declare function getPermitBulkAddressesByChainType(): Record<string, string | null>;
export declare function getPermitTriggerAddressesByChainType(): Record<string, string | null>;
export declare function getChainTypeTokensByChainType(): Record<string, string | null>;
export declare function getChainTypeWatcherIdentifiersByChainType(): Record<string, string | null>;
export declare function getActivatedChainTypes(): string[];
export declare function getChainTypeForAddress(address?: string): string | null | undefined;
export declare function getRewardAddressForChainType(chainType: string): string | null | undefined;
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
export declare function createProcessEvtService(eventSender: EvtSender): IProcessEventService;
export declare class ErgSettings {
    static rs_ErgoExplorerHost(): string;
    static rs_ErgoNodeHost(): string;
    static rs_dbName(): string;
    static rs_DbVersion(): number;
    static rs_InputsStoreName(): string;
    static rs_PerfTxStoreName(): string;
    static rs_PermitTxStoreName(): string;
    static rs_ActivePermitTxStoreName(): string;
    static rs_DownloadStatusStoreName(): string;
    static rs_OpenBoxesStoreName(): string;
    static rs_AddressDataStoreName(): string;
    static rs_InitialNDownloads(): number;
    static rs_FullDownloadsBatchSize(): number;
    static rs_PerfInitialNDownloads(): number;
    static rs_PerfFullDownloadsBatchSize(): number;
    static rs_StartFrom(): Date;
    static rs_Input_Key(): string[];
    static rs_Permit_Key(): string;
    static rs_ActivePermit_Key(): string;
    static rs_PerfTx_Key(): string;
    static rs_Address_Key(): string;
    static rs_PermitCost(): number;
    static rs_WatcherCollateralRSN(chainType: string): number;
    static rs_WatcherCollateralERG(chainType: string): number;
    static rs_RSNTokenId(): string;
    static rs_eRSNTokenId(): string;
    static rs_TokenIdMap(): Record<string, string>;
    static rs_RSNDecimals(): number;
}
