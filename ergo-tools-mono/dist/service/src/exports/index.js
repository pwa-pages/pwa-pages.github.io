export function getAllChainTypes() {
    const raw = Object.values(ChainType);
    const unique = Array.from(new Set(raw));
    return unique.filter(v => typeof v === 'string' || typeof v === 'number');
}
export function getActivatedChainTypes() {
    return getActiveChainTypes();
}
export function getChainTypeForAddress(address) {
    return getChainType(address);
}
export function createProcessEvtService(eventSender) {
    return new ProcessEventService(eventSender);
}
export class ErgConstants {
    static { this.rs_ErgoExplorerHost = rs_ErgoExplorerHost; }
    static { this.rs_ErgoNodeHost = rs_ErgoNodeHost; }
    static { this.rs_DbName = rs_DbName; }
    static { this.rs_DbVersion = rs_DbVersion; }
    static { this.rs_InputsStoreName = rs_InputsStoreName; }
    static { this.rs_PerfTxStoreName = rs_PerfTxStoreName; }
    static { this.rs_PermitTxStoreName = rs_PermitTxStoreName; }
    static { this.rs_ActivePermitTxStoreName = rs_ActivePermitTxStoreName; }
    static { this.rs_DownloadStatusStoreName = rs_DownloadStatusStoreName; }
    static { this.rs_OpenBoxesStoreName = rs_OpenBoxesStoreName; }
    static { this.rs_AddressDataStoreName = rs_AddressDataStoreName; }
    static { this.rs_InitialNDownloads = rs_InitialNDownloads; }
    static { this.rs_FullDownloadsBatchSize = rs_FullDownloadsBatchSize; }
    static { this.rs_PerfInitialNDownloads = rs_PerfInitialNDownloads; }
    static { this.rs_PerfFullDownloadsBatchSize = rs_PerfFullDownloadsBatchSize; }
    static { this.rs_StartFrom = rs_StartFrom; }
    static { this.rs_Input_Key = rs_Input_Key; }
    static { this.rs_Permit_Key = rs_Permit_Key; }
    static { this.rs_ActivePermit_Key = rs_ActivePermit_Key; }
    static { this.rs_PerfTx_Key = rs_PerfTx_Key; }
    static { this.rs_Address_Key = rs_Address_Key; }
    static { this.rs_PermitCost = rs_PermitCost; }
    static { this.rs_WatcherCollateralRSN = rs_WatcherCollateralRSN; }
    static { this.rs_WatcherCollateralERG = rs_WatcherCollateralERG; }
}
//# sourceMappingURL=index.js.map