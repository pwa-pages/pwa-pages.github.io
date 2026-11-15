"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    storageService;
    db;
    constructor(storageService) {
        this.storageService = storageService;
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
