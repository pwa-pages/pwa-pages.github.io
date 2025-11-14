export function getAllChainTypes() {
    const raw = Object.values(ChainType);
    const unique = Array.from(new Set(raw));
    return unique.filter(v => typeof v === 'string' || typeof v === 'number');
}
export function getCurrencyValues() {
    return Object.values(Currency);
}
export function getPermitAddressesByChainType() {
    return permitAddresses;
}
export function getPermitBulkAddressesByChainType() {
    return permitBulkAddresses;
}
export function getPermitTriggerAddressesByChainType() {
    return permitTriggerAddresses;
}
export function getChainTypeTokensByChainType() {
    return chainTypeTokens;
}
export function getChainTypeWatcherIdentifiersByChainType() {
    return chainTypeWatcherIdentifier;
}
export function getActivatedChainTypes() {
    return getActiveChainTypes();
}
export function getChainTypeForAddress(address) {
    return getChainType(address);
}
export function getRewardAddressForChainType(chainType) {
    return rewardAddresses[chainType];
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
    static rs_WatcherCollateralRSN() {
        return globalThis.rs_WatcherCollateralRSN;
    }
    static rs_WatcherCollateralERG() {
        return globalThis.rs_WatcherCollateralERG;
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
//# sourceMappingURL=index.js.map