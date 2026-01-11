export * from './address';
export * from './asset';
export * from './chainperf.chart.point';
export * from './chart.dataset';
export * from './chart.performance';
export * from './chart.point';
export * from './input';
export * from './permit.tx';
export * from './permit.info';
export * from './output';
export * from './token';
export * from './transaction';
export * from './watcher.info';
export function getAllChainTypes() {
    return globalThis.getChainTypes();
}
export function getCurrencyValues() {
    return globalThis.currencies;
}
export function getPermitAddressesByChainType() {
    return globalThis.permitAddresses;
}
export function getPermitBulkAddressesByChainType() {
    return globalThis.permitBulkAddresses;
}
export function getPermitTriggerAddressesByChainType() {
    return globalThis.permitTriggerAddresses;
}
export function getChainTypeTokensByChainType() {
    return globalThis.chainTypeTokens;
}
export function getChainTypeWatcherIdentifiersByChainType() {
    return globalThis.chainTypeWatcherIdentifier;
}
export function getActivatedChainTypes() {
    return globalThis.getActiveChainTypes();
}
export function getChainTypeForAddress(address) {
    return globalThis.getChainType(address);
}
export function getRewardAddressForChainType(chainType) {
    return globalThis.rewardAddresses[chainType];
}
export function createProcessEvtService(eventSender) {
    return globalThis.CreateProcessEventService(eventSender);
}
export class ErgSettings {
    static rs_ErgoExplorerHost() {
        return globalThis.rs_ErgoExplorerHost;
    }
    static rs_ErgoNodeHost() {
        return globalThis.rs_ErgoNodeHost;
    }
    static rs_dbName() {
        return globalThis.rs_DbName;
    }
    static rs_DbVersion() {
        return globalThis.rs_DbVersion;
    }
    static rs_InputsStoreName() {
        return globalThis.rs_InputsStoreName;
    }
    static rs_PerfTxStoreName() {
        return globalThis.rs_PerfTxStoreName;
    }
    static rs_PermitTxStoreName() {
        return globalThis.rs_PermitTxStoreName;
    }
    static rs_ActivePermitTxStoreName() {
        return globalThis.rs_ActivePermitTxStoreName;
    }
    static rs_DownloadStatusStoreName() {
        return globalThis.rs_DownloadStatusStoreName;
    }
    static rs_OpenBoxesStoreName() {
        return globalThis.rs_OpenBoxesStoreName;
    }
    static rs_AddressDataStoreName() {
        return globalThis.rs_AddressDataStoreName;
    }
    static rs_InitialNDownloads() {
        return globalThis.rs_InitialNDownloads;
    }
    static rs_FullDownloadsBatchSize() {
        return globalThis.rs_FullDownloadsBatchSize;
    }
    static rs_PerfInitialNDownloads() {
        return globalThis.rs_PerfInitialNDownloads;
    }
    static rs_PerfFullDownloadsBatchSize() {
        return globalThis.rs_PerfFullDownloadsBatchSize;
    }
    static rs_StartFrom() {
        return globalThis.rs_StartFrom;
    }
    static rs_Input_Key() {
        return globalThis.rs_Input_Key;
    }
    static rs_Permit_Key() {
        return globalThis.rs_Permit_Key;
    }
    static rs_ActivePermit_Key() {
        return globalThis.rs_ActivePermit_Key;
    }
    static rs_PerfTx_Key() {
        return globalThis.rs_PerfTx_Key;
    }
    static rs_Address_Key() {
        return globalThis.rs_Address_Key;
    }
    static rs_PermitCost() {
        return globalThis.rs_PermitCost;
    }
    static rs_WatcherCollateralRSN(chainType) {
        return globalThis.rs_WatcherCollateralRSN(chainType);
    }
    static rs_WatcherCollateralERG(chainType) {
        return globalThis.rs_WatcherCollateralERG(chainType);
    }
    static rs_RSNTokenId() {
        return globalThis.rs_RSNTokenId;
    }
    static rs_eRSNTokenId() {
        return globalThis.rs_eRSNTokenId;
    }
    static rs_TokenIdMap() {
        return globalThis.rs_TokenIdMap;
    }
    static rs_RSNDecimals() {
        return globalThis.rs_RSNDecimals;
    }
}
export function GetWatcherDataService(activePermitsDataService) {
    return globalThis.GetWatcherDataService(activePermitsDataService);
}
export function GetDownloadService(maxDownloadDateDifference) {
    return globalThis.CreateActivePermitsDownloadService(maxDownloadDateDifference, null);
}
//# sourceMappingURL=index.js.map