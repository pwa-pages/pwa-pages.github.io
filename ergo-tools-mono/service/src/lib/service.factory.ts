import { ChainPerformanceDataService } from "./chain.performance.data.service";
import { permitTriggerAddresses } from "./chain.service";
import { ChartService } from "./chart.service";
import { rs_ActivePermitTxStoreName, rs_FullDownloadsBatchSize, rs_InitialNDownloads, rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads } from "./constants";
import { DownloadService } from "./download.service";
import { DownloadStatusIndexedDbService } from "./download.status.indexeddb.service";
import { MemoryStorageService } from "./memory.storage.service";
import { PermitTx, EventType, DbInput, PerfTx, WatcherInfo } from "./models";
import { MyWatcherDataService } from "./mywatcher.data.service";
import { PermitsDataService } from "./permits.data.service";
import { CurrencyRates, PriceService } from "./price.service";
import { ReportsDataService } from "./reports.data.service";
import { RewardDataService } from "./reward.data.service";
import { TransactionDownloadService } from "./transaction.download.service";
import { WatchersDataService } from "./watchers.data.service";

export const GetPermitTriggerAddresses = () => {
  return permitTriggerAddresses;
};

export function CreatePermitsDownloadService(
  maxDownloadDateDifference: number
): TransactionDownloadService<PermitTx> {

  var storageService = new MemoryStorageService<PermitTx>();
  const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService, rs_ActivePermitTxStoreName, maxDownloadDateDifference);

  return new TransactionDownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    permitsDataService,
    null as unknown as EventSender,
    null,
  );
}

export const CreateWatcherDownloadService = (

): TransactionDownloadService<PermitTx> => {


  var storageService = new MemoryStorageService<PermitTx>();

  const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService, rs_ActivePermitTxStoreName);

  const watcherDataService: MyWatcherDataService =
    new MyWatcherDataService(permitsDataService);

  return new TransactionDownloadService<PermitTx>(
    rs_FullDownloadsBatchSize,
    rs_InitialNDownloads,
    watcherDataService,
    null as unknown as EventSender,
    null,
  );

};



export interface EventPayload<T> {
  type: EventType;
  data?: T;
}

export interface EventSender {
  sendEvent<T>(event: EventPayload<T>): Promise<void>;
}

export interface Services {
  dataService: RewardDataService;
  chainPerformanceDataService: ChainPerformanceDataService;
  myWatcherDataService: MyWatcherDataService;
  watchersDataService: WatchersDataService;
  permitsDataService: PermitsDataService;
  downloadService: TransactionDownloadService<DbInput>;
  chartService: ChartService;
  downloadPerfService: TransactionDownloadService<PerfTx>;
  downloadMyWatchersService: TransactionDownloadService<PermitTx>;
  downloadActivePermitsService: TransactionDownloadService<PermitTx>;
  reportsDataService: ReportsDataService;
  downloadReportsService: TransactionDownloadService<PermitTx>;
}

export async function createServices(
  eventSender: EventSender,
  db: IDBDatabase,
): Promise<Services> {
  const chartService: ChartService = new ChartService();
  const rewardDataService: RewardDataService = new RewardDataService(
    db,
    chartService,
    eventSender,
  );

  const permitsDataService: PermitsDataService =
    new PermitsDataService(db);
  const reportsDataService: ReportsDataService =
    new ReportsDataService(db, eventSender);
  const myWatcherDataService: MyWatcherDataService = new MyWatcherDataService(
    permitsDataService,
  );

  const downloadServiceWatcherInfo = new DownloadService<WatcherInfo>(eventSender, db);
  const downloadServciceCurrencyRates = new DownloadService<CurrencyRates>(eventSender, db);
  const priceService: PriceService = new PriceService(
    downloadServciceCurrencyRates,
  );

  const watchersDataService: WatchersDataService = new WatchersDataService(
    downloadServiceWatcherInfo, priceService, eventSender
  );

  const chainPerformanceDataService: ChainPerformanceDataService =
    new ChainPerformanceDataService(db, eventSender);

  const downloadStatusIndexedDbRewardDataService =
    new DownloadStatusIndexedDbService<DbInput>(rewardDataService, db);
  const downloadStatusIndexedDbWatcherDataService =
    new DownloadStatusIndexedDbService<PermitTx>(myWatcherDataService, db);
  const downloadStatusIndexedDbPermitsDataService =
    new DownloadStatusIndexedDbService<PermitTx>(permitsDataService, db);
  const downloadStatusIndexedDbChainPerformanceDataService =
    new DownloadStatusIndexedDbService<PerfTx>(chainPerformanceDataService, db);

  const downloadRewardService: TransactionDownloadService<DbInput> =
    new TransactionDownloadService<DbInput>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      rewardDataService,
      eventSender,
      downloadStatusIndexedDbRewardDataService,
    );
  const downloadMyWatchersService: TransactionDownloadService<PermitTx> =
    new TransactionDownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      myWatcherDataService,
      eventSender,
      downloadStatusIndexedDbWatcherDataService,
    );
  const downloadActivePermitsService: TransactionDownloadService<PermitTx> =
    new TransactionDownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      permitsDataService,
      eventSender,
      downloadStatusIndexedDbPermitsDataService,
    );
  const downloadReportsService: TransactionDownloadService<PermitTx> =
    new TransactionDownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      reportsDataService,
      eventSender,
      downloadStatusIndexedDbPermitsDataService,
    );
  const downloadPerfService: TransactionDownloadService<PerfTx> =
    new TransactionDownloadService<PerfTx>(
      rs_PerfFullDownloadsBatchSize,
      rs_PerfInitialNDownloads,
      chainPerformanceDataService,
      eventSender,
      downloadStatusIndexedDbChainPerformanceDataService,
    );

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
