import { ChainPerformanceDataService } from "./chain.performance.data.service";
import { permitTriggerAddresses } from "./chain.service";
import { ChartService } from "./chart.service";
import { IStorageService, rs_ActivePermitTxStoreName, rs_DbName, rs_FullDownloadsBatchSize, rs_InitialNDownloads, rs_PerfFullDownloadsBatchSize, rs_PerfInitialNDownloads } from "./constants";
import { DataService } from "./data.service";
import { DownloadService } from "./download.service";
import { DownloadStatusIndexedDbService } from "./download.status.indexeddb.service";
import { DownloadStatusMemoryService } from "./download.status.memory.service";
import { DownloadStatusService } from "./download.status.service";
import { IDBDatabaseStorageService } from "./i-db-databasestorage.service";
import { MemoryStorageService } from "./memory.storage.service";
import { PermitTx, EventType, DbInput, PerfTx } from "./models";
import { MyWatcherDataService } from "./mywatcher.data.service";
import { PermitsDataService } from "./permits.data.service";
import { PriceService } from "./price.service";
import { ReportsDataService } from "./reports.data.service";
import { RewardDataService } from "./reward.data.service";
import { TransactionDownloadService } from "./transaction.download.service";
import { WatchersDataService } from "./watchers.data.service";

export async function initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      let dbName = rs_DbName;

      const request: IDBOpenDBRequest = indexedDB.open(dbName);

      request.onsuccess = (event: Event) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event: Event) => {
        console.error(
          'Error opening IndexedDB:',
          (event.target as IDBOpenDBRequest).error,
        );
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }


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

export enum StorageType {
  Memory,
  IndexedDB,
  FileSystem
}

export async function createServices(
  eventSender: EventSender,
  storageType: StorageType
): Promise<Services> {

  let storageService: IStorageService;
  let db: IDBDatabase | undefined;

  if (storageType === StorageType.IndexedDB) {
    db = await initIndexedDB();
    storageService = new IDBDatabaseStorageService(db);
  } else if (storageType === StorageType.Memory) {
    storageService = new MemoryStorageService();
  } else {
    throw new Error("Unsupported storage type");
  }

  const createDownloadStatusService = <T>(
    dataService: DataService<T>,
  ): DownloadStatusService => {
    if (storageType === StorageType.IndexedDB) {
      if (!db) {
        throw new Error("IndexedDB is not initialized");
      }
      return new DownloadStatusIndexedDbService(dataService, db);
    }

    return new DownloadStatusMemoryService(dataService, storageService);
  };

  const chartService: ChartService = new ChartService();
  const rewardDataService: RewardDataService = new RewardDataService(
    storageService,
    chartService,
    eventSender,
  );

  const permitsDataService: PermitsDataService =
    new PermitsDataService(storageService);
  const reportsDataService: ReportsDataService =
    new ReportsDataService(storageService, eventSender);
  const myWatcherDataService: MyWatcherDataService = new MyWatcherDataService(
    permitsDataService,
  );

  const downloadServiceWatcherInfo = new DownloadService(eventSender, storageService);
  const downloadServciceCurrencyRates = new DownloadService(eventSender, storageService);
  const priceService: PriceService = new PriceService(
    downloadServciceCurrencyRates,
  );

  const watchersDataService: WatchersDataService = new WatchersDataService(
    downloadServiceWatcherInfo, priceService, eventSender
  );

  const chainPerformanceDataService: ChainPerformanceDataService =
    new ChainPerformanceDataService(storageService, eventSender);

  const downloadStatusRewardDataService =
    createDownloadStatusService(rewardDataService);
  const downloadStatusWatcherDataService =
    createDownloadStatusService(myWatcherDataService);
  const downloadStatusPermitsDataService =
    createDownloadStatusService(permitsDataService);
  const downloadStatusReportsDataService =
    createDownloadStatusService(reportsDataService);
  const downloadStatusChainPerformanceDataService =
    createDownloadStatusService(chainPerformanceDataService);

  const downloadRewardService: TransactionDownloadService<DbInput> =
    new TransactionDownloadService<DbInput>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      rewardDataService,
      eventSender,
      downloadStatusRewardDataService,
    );
  const downloadMyWatchersService: TransactionDownloadService<PermitTx> =
    new TransactionDownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      myWatcherDataService,
      eventSender,
      downloadStatusWatcherDataService,
    );
  const downloadActivePermitsService: TransactionDownloadService<PermitTx> =
    new TransactionDownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      permitsDataService,
      eventSender,
      downloadStatusPermitsDataService,
    );
  const downloadReportsService: TransactionDownloadService<PermitTx> =
    new TransactionDownloadService<PermitTx>(
      rs_FullDownloadsBatchSize,
      rs_InitialNDownloads,
      reportsDataService,
      eventSender,
      downloadStatusReportsDataService,
    );
  const downloadPerfService: TransactionDownloadService<PerfTx> =
    new TransactionDownloadService<PerfTx>(
      rs_PerfFullDownloadsBatchSize,
      rs_PerfInitialNDownloads,
      chainPerformanceDataService,
      eventSender,
      downloadStatusChainPerformanceDataService,
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
