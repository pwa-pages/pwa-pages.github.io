"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErgSettings = void 0;
exports.getAllChainTypes = getAllChainTypes;
exports.getCurrencyValues = getCurrencyValues;
exports.getPermitAddressesByChainType = getPermitAddressesByChainType;
exports.getPermitBulkAddressesByChainType = getPermitBulkAddressesByChainType;
exports.getPermitTriggerAddressesByChainType = getPermitTriggerAddressesByChainType;
exports.getChainTypeTokensByChainType = getChainTypeTokensByChainType;
exports.getChainTypeWatcherIdentifiersByChainType = getChainTypeWatcherIdentifiersByChainType;
exports.getActivatedChainTypes = getActivatedChainTypes;
exports.getChainTypeForAddress = getChainTypeForAddress;
exports.getRewardAddressForChainType = getRewardAddressForChainType;
exports.createProcessEvtService = createProcessEvtService;
exports.GetDownloadService = GetDownloadService;
__exportStar(require("./address"), exports);
__exportStar(require("./asset"), exports);
__exportStar(require("./chainperf.chart.point"), exports);
__exportStar(require("./chart.dataset"), exports);
__exportStar(require("./chart.performance"), exports);
__exportStar(require("./chart.point"), exports);
__exportStar(require("./input"), exports);
__exportStar(require("./permit.tx"), exports);
__exportStar(require("./output"), exports);
__exportStar(require("./token"), exports);
__exportStar(require("./transaction"), exports);
__exportStar(require("./watcher.info"), exports);
function getAllChainTypes() {
    return globalThis.getChainTypes();
}
function getCurrencyValues() {
    return globalThis.currencies;
}
function getPermitAddressesByChainType() {
    return globalThis.permitAddresses;
}
function getPermitBulkAddressesByChainType() {
    return globalThis.permitBulkAddresses;
}
function getPermitTriggerAddressesByChainType() {
    return globalThis.permitTriggerAddresses;
}
function getChainTypeTokensByChainType() {
    return globalThis.chainTypeTokens;
}
function getChainTypeWatcherIdentifiersByChainType() {
    return globalThis.chainTypeWatcherIdentifier;
}
function getActivatedChainTypes() {
    return globalThis.getActiveChainTypes();
}
function getChainTypeForAddress(address) {
    return globalThis.getChainType(address);
}
function getRewardAddressForChainType(chainType) {
    return globalThis.rewardAddresses[chainType];
}
function createProcessEvtService(eventSender) {
    return globalThis.CreateProcessEventService(eventSender);
}
class ErgSettings {
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
exports.ErgSettings = ErgSettings;
function GetDownloadService(maxDownloadDateDifference) {
    return globalThis.CreateActivePermitsDownloadService(maxDownloadDateDifference, null);
}
