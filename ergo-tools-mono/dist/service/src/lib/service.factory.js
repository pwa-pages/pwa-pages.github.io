import { ChainPerformanceDataService } from "./chain.performance.data.service";
import { permitTriggerAddresses } from "./chain.service";
import { ChartService } from "./chart.service";
import { rs_ActivePermitTxStoreName, rs_FullDownloadsBatchSize, rs_InitialNDownloads, rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads } from "./constants";
import { DownloadService } from "./download.service";
import { DownloadStatusIndexedDbService } from "./download.status.indexeddb.service";
import { MemoryStorageService } from "./memory.storage.service";
import { MyWatcherDataService } from "./mywatcher.data.service";
import { PermitsDataService } from "./permits.data.service";
import { PriceService } from "./price.service";
import { ReportsDataService } from "./reports.data.service";
import { RewardDataService } from "./reward.data.service";
import { TransactionDownloadService } from "./transaction.download.service";
import { WatchersDataService } from "./watchers.data.service";
export const GetPermitTriggerAddresses = () => {
    return permitTriggerAddresses;
};
export function CreatePermitsDownloadService(maxDownloadDateDifference) {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);
    return new TransactionDownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, permitsDataService, null, null);
}
export const CreateWatcherDownloadService = () => {
    var storageService = new MemoryStorageService();
    const permitsDataService = new PermitsDataService(storageService, rs_ActivePermitTxStoreName);
    const watcherDataService = new MyWatcherDataService(permitsDataService);
    return new TransactionDownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, watcherDataService, null, null);
};
export async function createServices(eventSender, db) {
    const chartService = new ChartService();
    const rewardDataService = new RewardDataService(db, chartService, eventSender);
    const permitsDataService = new PermitsDataService(db);
    const reportsDataService = new ReportsDataService(db, eventSender);
    const myWatcherDataService = new MyWatcherDataService(permitsDataService);
    const downloadServiceWatcherInfo = new DownloadService(eventSender, db);
    const downloadServciceCurrencyRates = new DownloadService(eventSender, db);
    const priceService = new PriceService(downloadServciceCurrencyRates);
    const watchersDataService = new WatchersDataService(downloadServiceWatcherInfo, priceService, eventSender);
    const chainPerformanceDataService = new ChainPerformanceDataService(db, eventSender);
    const downloadStatusIndexedDbRewardDataService = new DownloadStatusIndexedDbService(rewardDataService, db);
    const downloadStatusIndexedDbWatcherDataService = new DownloadStatusIndexedDbService(myWatcherDataService, db);
    const downloadStatusIndexedDbPermitsDataService = new DownloadStatusIndexedDbService(permitsDataService, db);
    const downloadStatusIndexedDbChainPerformanceDataService = new DownloadStatusIndexedDbService(chainPerformanceDataService, db);
    const downloadRewardService = new TransactionDownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, rewardDataService, eventSender, downloadStatusIndexedDbRewardDataService);
    const downloadMyWatchersService = new TransactionDownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, myWatcherDataService, eventSender, downloadStatusIndexedDbWatcherDataService);
    const downloadActivePermitsService = new TransactionDownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, permitsDataService, eventSender, downloadStatusIndexedDbPermitsDataService);
    const downloadReportsService = new TransactionDownloadService(rs_FullDownloadsBatchSize, rs_InitialNDownloads, reportsDataService, eventSender, downloadStatusIndexedDbPermitsDataService);
    const downloadPerfService = new TransactionDownloadService(rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads, chainPerformanceDataService, eventSender, downloadStatusIndexedDbChainPerformanceDataService);
    return {
        dataService: rewardDataService,
        chainPerformanceDataService,
        myWatcherDataService: myWatcherDataService,
        watchersDataService: watchersDataService,
        downloadService: downloadRewardService,
        chartService,
        downloadPerfService,
        downloadMyWatchersService,
        downloadActivePermitsService,
        permitsDataService,
        reportsDataService,
        downloadReportsService,
    };
}
//# sourceMappingURL=service.factory.js.map