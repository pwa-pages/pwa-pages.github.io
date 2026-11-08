import { ChainPerformanceDataService } from "./chain.performance.data.service";
import { permitTriggerAddresses } from "./chain.service";
import { ChartService } from "./chart.service";
import { rs_ActivePermitTxStoreName, rs_FullDownloadsBatchSize, rs_InitialNDownloads, rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads } from "./constants";
import { DownloadStatusIndexedDbService } from "./download.status.indexeddb.service";
import { MemoryStorageService } from "./memory.storage.service";
import { PermitTx, EventType, DbInput, PerfTx } from "./models";
import { MyWatcherDataService } from "./mywatcher.data.service";
import { PermitsDataService } from "./permits.data.service";
import { ReportsDataService } from "./reports.data.service";
import { RewardDataService } from "./reward.data.service";
import { TransactionDownloadService } from "./transaction.download.service";

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
  watcherDataService: MyWatcherDataService;
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
  const watcherDataService: MyWatcherDataService = new MyWatcherDataService(
    permitsDataService,
  );

  const chainPerformanceDataService: ChainPerformanceDataService =
    new ChainPerformanceDataService(db, eventSender);

  const downloadStatusIndexedDbRewardDataService =
    new DownloadStatusIndexedDbService<DbInput>(rewardDataService, db);
  const downloadStatusIndexedDbWatcherDataService =
    new DownloadStatusIndexedDbService<PermitTx>(watcherDataService, db);
  const downloadStatusIndexedDbPermitsDataService =
    new DownloadStatusIndexedDbService<PermitTx>(permitsDataService, db);
  const downloadStatusIndexedDbChainPerformanceDataService =
    new DownloadStatusIndexedDbService<PerfTx>(chainPerformanceDataService, db);

  const downloadService: TransactionDownloadService<DbInput> =
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
      watcherDataService,
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
    watcherDataService,
    downloadService,
    chartService,
    downloadPerfService,
    downloadMyWatchersService,
    downloadActivePermitsService,
    permitsDataService,
    reportsDataService,
    downloadReportsService,
  };
}
