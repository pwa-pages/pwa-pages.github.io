import { Address } from "./address";
import { IDBDatabaseStorageService } from "./i-db-databasestorage.service";
export class ChartPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class ChartPerformance {
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
export class ChainChartPerformance {
    constructor(address, addressForDisplay, chart, color, chainType) {
        this.address = address;
        this.addressForDisplay = addressForDisplay;
        this.chart = chart;
        this.chainType = chainType;
        this.color = color;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class DataService {
    constructor(dbOrStorage) {
        if (dbOrStorage?.transaction !== undefined) {
            this.db = dbOrStorage;
            this.storageService = new IDBDatabaseStorageService(this.db);
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
export { Address };
//# sourceMappingURL=data.service.js.map