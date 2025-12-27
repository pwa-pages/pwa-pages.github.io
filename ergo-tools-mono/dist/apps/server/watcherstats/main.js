var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// dist/service/commonjs/src/exports/address.js
var require_address = __commonJS({
  "dist/service/commonjs/src/exports/address.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Address = void 0;
    var Address = class {
      address;
      Address;
      active = true;
      chainType;
      smallAddressForDisplay;
      largeAddressForDisplay;
      constructor(address, chainType, active = true) {
        this.address = address;
        this.Address = address;
        this.smallAddressForDisplay = address.substring(0, 6) + "...";
        this.largeAddressForDisplay = address.substring(0, 6) + "..." + address.substring(address.length - 6, address.length);
        this.chainType = chainType;
        this.active = active;
      }
    };
    exports2.Address = Address;
  }
});

// dist/service/commonjs/src/exports/asset.js
var require_asset = __commonJS({
  "dist/service/commonjs/src/exports/asset.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Asset = void 0;
    var Asset = class {
      amount;
      name;
      decimals;
      type;
      tokenId;
      constructor(amount, name, decimals, type, tokenId) {
        this.amount = amount;
        this.name = name;
        this.decimals = decimals;
        this.type = type;
        this.tokenId = tokenId;
      }
    };
    exports2.Asset = Asset;
  }
});

// dist/service/commonjs/src/exports/chainperf.chart.point.js
var require_chainperf_chart_point = __commonJS({
  "dist/service/commonjs/src/exports/chainperf.chart.point.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainPerfChartPoint = void 0;
    var ChainPerfChartPoint = class {
      x;
      y;
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    exports2.ChainPerfChartPoint = ChainPerfChartPoint;
  }
});

// dist/service/commonjs/src/exports/chart.dataset.js
var require_chart_dataset = __commonJS({
  "dist/service/commonjs/src/exports/chart.dataset.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainPerfChartDataSet = exports2.ChartDataSet = void 0;
    var ChartDataSet = class {
      label;
      data;
      backgroundColor;
      pointBackgroundColor;
      borderColor;
      borderWidth;
      borderSkipped;
      constructor(chartColor) {
        this.label = "";
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
      }
    };
    exports2.ChartDataSet = ChartDataSet;
    var ChainPerfChartDataSet = class {
      label;
      data;
      backgroundColor;
      pointBackgroundColor;
      borderColor;
      borderWidth;
      borderSkipped;
      constructor(chartColor) {
        this.label = "";
        this.data = [];
        this.backgroundColor = chartColor;
        this.pointBackgroundColor = chartColor;
        this.borderColor = chartColor;
        this.borderWidth = 0;
        this.borderSkipped = false;
      }
    };
    exports2.ChainPerfChartDataSet = ChainPerfChartDataSet;
  }
});

// dist/service/commonjs/src/exports/chart.performance.js
var require_chart_performance = __commonJS({
  "dist/service/commonjs/src/exports/chart.performance.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainChartPerformance = exports2.ChartPerformance = void 0;
    var ChartPerformance = class {
      address;
      addressForDisplay;
      chart;
      chainType;
      color;
      constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
      }
    };
    exports2.ChartPerformance = ChartPerformance;
    var ChainChartPerformance = class {
      address;
      addressForDisplay;
      chart;
      chainType;
      color;
      constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
      }
    };
    exports2.ChainChartPerformance = ChainChartPerformance;
  }
});

// dist/service/commonjs/src/exports/chart.point.js
var require_chart_point = __commonJS({
  "dist/service/commonjs/src/exports/chart.point.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChartPoint = void 0;
    var ChartPoint = class {
      x;
      y;
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    exports2.ChartPoint = ChartPoint;
  }
});

// dist/service/commonjs/src/exports/input.js
var require_input = __commonJS({
  "dist/service/commonjs/src/exports/input.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Input = void 0;
    var Input = class {
      outputAddress;
      inputDate;
      boxId;
      assets;
      outputCreatedAt;
      address;
      accumulatedAmount;
      amount;
      chainType;
      constructor(inputDate, address, outputCreatedAt, assets, outputAddress, boxId, accumulatedAmount, amount, chainType) {
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
    };
    exports2.Input = Input;
  }
});

// dist/service/commonjs/src/exports/output.js
var require_output = __commonJS({
  "dist/service/commonjs/src/exports/output.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Output = void 0;
    var Output = class {
      outputAddress;
      outputDate;
      boxId;
      assets;
      constructor(boxId, outputDate, assets, outputAddress) {
        this.outputAddress = outputAddress;
        this.outputDate = outputDate;
        this.assets = assets;
        this.boxId = boxId;
      }
    };
    exports2.Output = Output;
  }
});

// dist/service/commonjs/src/exports/token.js
var require_token = __commonJS({
  "dist/service/commonjs/src/exports/token.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Token = void 0;
    var Token = class {
      tokenId;
      amount;
      decimals;
      name;
      tokenType;
      constructor(tokenId, amount, decimals, name, tokenType) {
        this.tokenId = tokenId;
        this.amount = amount;
        this.decimals = decimals;
        this.name = name;
        this.tokenType = tokenType;
      }
    };
    exports2.Token = Token;
  }
});

// dist/service/commonjs/src/exports/transaction.js
var require_transaction = __commonJS({
  "dist/service/commonjs/src/exports/transaction.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Transaction = void 0;
    var Transaction = class {
      timestamp;
      inputs;
      id;
      outputs;
      constructor(timestamp, inputs, id, outputs) {
        this.timestamp = timestamp;
        this.inputs = inputs;
        this.id = id;
        this.outputs = outputs;
      }
    };
    exports2.Transaction = Transaction;
  }
});

// dist/service/commonjs/src/exports/watcher.info.js
var require_watcher_info = __commonJS({
  "dist/service/commonjs/src/exports/watcher.info.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MyWatchersStats = exports2.WatcherInfo = void 0;
    var WatcherInfo = class {
      tokens;
      constructor(tokens) {
        this.tokens = tokens;
      }
    };
    exports2.WatcherInfo = WatcherInfo;
    var MyWatchersStats = class {
      activePermitCount;
      permitCount;
      wid;
      chainType;
      address;
    };
    exports2.MyWatchersStats = MyWatchersStats;
  }
});

// dist/service/commonjs/src/exports/index.js
var require_exports = __commonJS({
  "dist/service/commonjs/src/exports/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ErgSettings = void 0;
    exports2.getAllChainTypes = getAllChainTypes;
    exports2.getCurrencyValues = getCurrencyValues;
    exports2.getPermitAddressesByChainType = getPermitAddressesByChainType;
    exports2.getPermitBulkAddressesByChainType = getPermitBulkAddressesByChainType;
    exports2.getPermitTriggerAddressesByChainType = getPermitTriggerAddressesByChainType;
    exports2.getChainTypeTokensByChainType = getChainTypeTokensByChainType;
    exports2.getChainTypeWatcherIdentifiersByChainType = getChainTypeWatcherIdentifiersByChainType;
    exports2.getActivatedChainTypes = getActivatedChainTypes;
    exports2.getChainTypeForAddress = getChainTypeForAddress;
    exports2.getRewardAddressForChainType = getRewardAddressForChainType;
    exports2.createProcessEvtService = createProcessEvtService;
    exports2.GetDownloadService = GetDownloadService2;
    __exportStar(require_address(), exports2);
    __exportStar(require_asset(), exports2);
    __exportStar(require_chainperf_chart_point(), exports2);
    __exportStar(require_chart_dataset(), exports2);
    __exportStar(require_chart_performance(), exports2);
    __exportStar(require_chart_point(), exports2);
    __exportStar(require_input(), exports2);
    __exportStar(require_output(), exports2);
    __exportStar(require_token(), exports2);
    __exportStar(require_transaction(), exports2);
    __exportStar(require_watcher_info(), exports2);
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
    var ErgSettings = class {
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
    };
    exports2.ErgSettings = ErgSettings;
    function GetDownloadService2() {
      return globalThis.CreateActivePermitsDownloadService(null);
    }
  }
});

// apps/server/watcherstats/src/main.ts
var import_service = __toESM(require_exports());
console.log("Hello World");
var downloadService = (0, import_service.GetDownloadService)();
downloadService.downloadForAddress(
  "9fTbZHMsuBeWYAWsw7Nr61zNSe4i2FLrREhJcFGRkKLmNYVFwqL",
  true
);
