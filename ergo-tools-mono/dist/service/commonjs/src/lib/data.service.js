"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = exports.DataService = exports.ChainChartPerformance = exports.ChartPerformance = exports.ChartPoint = void 0;
const address_1 = require("./address");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return address_1.Address; } });
const i_db_databasestorage_service_1 = require("./i-db-databasestorage.service");
class ChartPoint {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.ChartPoint = ChartPoint;
class ChartPerformance {
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
}
exports.ChartPerformance = ChartPerformance;
class ChainChartPerformance {
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
}
exports.ChainChartPerformance = ChainChartPerformance;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    storageService;
    db;
    constructor(dbOrStorage) {
        if (dbOrStorage?.transaction !== undefined) {
            this.db = dbOrStorage;
            this.storageService = new i_db_databasestorage_service_1.IDBDatabaseStorageService(this.db);
        }
        else {
            this.storageService = dbOrStorage;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async purgeData() {
        // Empty implementation
    }
    getMaxDownloadDateDifference() {
        return 3155760000000;
    }
}
exports.DataService = DataService;
