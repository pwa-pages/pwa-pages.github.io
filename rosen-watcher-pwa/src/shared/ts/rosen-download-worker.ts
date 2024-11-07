// No triple-slash directives or 'declare const self'

// Define interfaces for the data structures used
interface MessageEventData {
  type: string;
}

interface Asset {
  // Define the structure of an asset here
  // Example properties:
  id: string;
  name: string;
  quantity: number;
  amount: number;
  decimals: number;
}

interface Input {
  boxId: string;
  outputAddress: string;
  inputDate: Date;
  assets: Asset[]; // Replace with actual Asset structure
  address: string;
  amount?: number;
  accumulatedAmount?: number;
  chainType?: ChainType | null;
}

interface TransactionItem {
  outputCreatedAt: string | number | Date;
  timestamp: string;
  inputs: Input[];
}

interface FetchTransactionsResponse {
  transactions: TransactionItem[];
  items: TransactionItem[];
  total: number;
}

interface DbInput {
  outputAddress: string;
  inputDate: Date;
  boxId: string;
  assets: Asset[]; // Replace with actual Asset structure
  address?: string;
}

interface DownloadStatus {
  address: string;
  status: string;
}

let busyCounter = 0;

// Service Worker Event Listener
self.addEventListener('message', async (event: MessageEvent) => {
  const data: MessageEventData = event.data;

  console.log(`Rosen service worker received event of type ${data.type}`);

  if (data && data.type === 'StatisticsScreenLoaded') {
    console.log(
      'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    try {
      const db: IDBDatabase = await initIndexedDB();

      const dataService = new DataService(db);
      const downloadService = new DownloadService(dataService);

      const inputs = await dataService.getSortedInputs();
      sendMessageToClients({ type: 'InputsChanged', data: inputs });

      await downloadService.downloadForAddresses();
    } catch (error) {
      console.error('Error initializing IndexedDB or downloading addresses:', error);
    }
  } else if (data && data.type === 'PerformanceScreenLoaded') {
    console.log('Rosen service worker received PerformanceScreenLoaded');

    try {
      const db: IDBDatabase = await initIndexedDB();
      const dataService = new DataService(db);

      const inputs = await dataService.getSortedInputs();
      sendMessageToClients({ type: 'InputsChanged', data: inputs });
    } catch (error) {
      console.error('Error initializing IndexedDB or downloading addresses:', error);
    }
  }
});

async function getWatcherInputs(db: IDBDatabase): Promise<Input[]> {
  const inputsPromise = getData<Input>(rs_InputsStoreName, db);

  try {
    const inputs = await inputsPromise;

    const result_1 = inputs.filter((i: Input) => getChainType(i.address) != null);

    result_1.forEach((input: Input) => {
      input.assets = input.assets
        .filter((asset: Asset) => asset.name === 'RSN' || asset.name === 'eRSN')
        .map((asset_1: Asset) => {
          return asset_1;
        });
    });

    return await new Promise<Input[]>((resolve) => {
      resolve(result_1);
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getSortedInputs(db: IDBDatabase): Promise<Input[]> {
  const inputsPromise = await getWatcherInputs(db);
  let amount = 0;
  const sortedInputs: Input[] = [];
  console.log('start retrieving chart from database');
  try {
    const inputs = await inputsPromise;

    inputs.sort((a, b) => a.inputDate.getTime() - b.inputDate.getTime());

    inputs.forEach((input: Input) => {
      input.assets.forEach((asset: Asset) => {
        amount += asset.amount;
        sortedInputs.push({
          inputDate: input.inputDate,
          address: input.address,
          assets: input.assets,
          outputAddress: input.outputAddress,
          boxId: input.boxId,
          accumulatedAmount: amount,
          amount: asset.amount / Math.pow(10, asset.decimals),
          chainType: getChainType(input.address),
        });
      });
    });
    console.log('done retrieving chart from database ' + inputs.length + ' inputs');
    return await new Promise<Input[]>((resolve) => {
      resolve(sortedInputs);
    });
  } catch (error) {
    console.error(error);
    return sortedInputs;
  }
}

// IndexedDB Initialization
async function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(rs_DbName, rs_DbVersion);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

      if (db.objectStoreNames.contains(rs_InputsStoreName)) {
        db.deleteObjectStore(rs_InputsStoreName);
      }
      db.createObjectStore(rs_InputsStoreName, { keyPath: rs_Input_Key });

      if (!db.objectStoreNames.contains(rs_AddressDataStoreName)) {
        db.createObjectStore(rs_AddressDataStoreName, { keyPath: rs_Address_Key });
      }

      // Create the new store for download status
      if (!db.objectStoreNames.contains(rs_DownloadStatusStoreName)) {
        db.createObjectStore(rs_DownloadStatusStoreName, { keyPath: rs_Address_Key });
      }
    };

    request.onsuccess = (event: Event) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      console.error('Error opening IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Send messages to clients (active pages)
async function sendMessageToClients<T>(message: { type: string; data?: T }): Promise<void> {
  const clientsList = await (self as unknown as ServiceWorkerGlobalScope).clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  for (const client of clientsList) {
    client.postMessage(message);
  }
}

// Busy Counter
function increaseBusyCounter(): void {
  if (busyCounter === 0) {
    sendMessageToClients({ type: 'StartFullDownload' });
  }
  busyCounter++;
}

function decreaseBusyCounter(): void {
  busyCounter--;
  if (busyCounter === 0) {
    sendMessageToClients({ type: 'EndFullDownload' });
  }
}

// Fetch Transactions
async function fetchTransactions(url: string): Promise<FetchTransactionsResponse> {
  try {
    const response: Response = await fetch(url);
    if (!response.ok) throw new Error(`Server returned code: ${response.status}`);
    return (await response.json()) as FetchTransactionsResponse;
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    throw error;
  }
}

// Add Data to IndexedDB
async function addData(
  address: string,
  transactions: TransactionItem[],
  db: IDBDatabase,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction([rs_InputsStoreName], 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);

    const putPromises: Promise<void>[] = transactions.flatMap((item: TransactionItem) =>
      item.inputs.map((input: Input) => {
        input.outputAddress = address;
        input.inputDate = new Date(item.timestamp);

        const dbInput: DbInput = {
          outputAddress: input.outputAddress,
          inputDate: input.inputDate,
          boxId: input.boxId,
          assets: input.assets || [],
          address: input.address,
        };

        return new Promise<void>((putResolve, putReject) => {
          const request: IDBRequest = objectStore.put(dbInput);
          request.onsuccess = () => putResolve();
          request.onerror = (event: Event) => putReject((event.target as IDBRequest).error);
        });
      }),
    );

    Promise.all(putPromises)
      .then(async () => {
        const inputs = await getSortedInputs(db);
        sendMessageToClients({ type: 'InputsChanged', data: inputs });
        resolve();
      })
      .catch(reject);
  });
}

// Download Transactions
async function downloadTransactions(
  address: string,
  offset = 0,
  limit = 500,
): Promise<FetchTransactionsResponse> {
  const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
  console.log(`Downloading from: ${url}`);

  sendMessageToClients({ type: 'StartDownload' });

  const response: FetchTransactionsResponse = await fetchTransactions(url);
  const result: FetchTransactionsResponse = {
    transactions: response.items,
    total: response.total,
    items: [],
  };

  for (const item of response.items) {
    const inputDate: Date = new Date(item.timestamp);
    if (inputDate < rs_StartFrom) {
      sendMessageToClients({ type: 'EndDownload' });
      return result;
    }
  }

  sendMessageToClients({ type: 'EndDownload' });
  return result;
}

// Get Data from IndexedDB
async function getData<T>(storeName: string, db: IDBDatabase): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction([storeName], 'readonly');
    const objectStore: IDBObjectStore = transaction.objectStore(storeName);
    const request: IDBRequest = objectStore.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Get Download Status for Address from IndexedDB
async function getDownloadStatus(address: string, db: IDBDatabase): Promise<string> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readonly');
    const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);
    const request: IDBRequest = objectStore.get(address);

    request.onsuccess = () => resolve((request.result as DownloadStatus)?.status || 'false');
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Set Download Status for Address in IndexedDB
async function setDownloadStatus(address: string, status: string, db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction([rs_DownloadStatusStoreName], 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore(rs_DownloadStatusStoreName);
    const Address = address;
    const request: IDBRequest = objectStore.put({ Address, address, status });

    request.onsuccess = () => resolve();
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function downloadForAddress(address: string, db: IDBDatabase): Promise<void> {
  increaseBusyCounter();
  console.log(busyCounter);

  try {
    const result: FetchTransactionsResponse = await downloadTransactions(
      address,
      0,
      rs_InitialNDownloads,
    );
    console.log(`Processing initial download(size = ${rs_InitialNDownloads}) for: ${address}`);

    const itemsz: number = result.transactions.length;
    let halfBoxId = '';

    if (itemsz > rs_InitialNDownloads / 2) {
      for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
        const item: TransactionItem = result.transactions[i];
        for (const input of item.inputs) {
          if (input.boxId && halfBoxId === '') {
            halfBoxId = input.boxId;
          }
        }
      }
    }

    const boxData = await getDataByBoxId(halfBoxId, address, db);
    console.log('Add bunch of data');
    await addData(address, result.transactions, db);

    const downloadStatus: string = await getDownloadStatus(address, db);
    if (boxData && downloadStatus === 'true') {
      console.log(`Found existing boxId in db for ${address}, no need to download more.`);
    } else if (itemsz >= rs_InitialNDownloads) {
      await setDownloadStatus(address, 'false', db);
      console.log(`Downloading all tx's for : ${address}`);
      await downloadAllForAddress(address, 0, db);
    }
  } catch (e) {
    console.error(e);
  } finally {
    decreaseBusyCounter();
    console.log(busyCounter);
  }
}

// Get Data by BoxId from IndexedDB
async function getDataByBoxId(
  boxId: string,
  addressId: string,
  db: IDBDatabase,
): Promise<DbInput | null> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction([rs_InputsStoreName], 'readonly');
    const objectStore: IDBObjectStore = transaction.objectStore(rs_InputsStoreName);
    const request: IDBRequest = objectStore.get([boxId, addressId]);

    request.onsuccess = () => {
      const result: DbInput | undefined = request.result as DbInput | undefined;
      if (!result || result.outputAddress !== addressId) {
        resolve(null);
      } else {
        resolve(result);
      }
    };

    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Download All for Address (recursive)
async function downloadAllForAddress(
  address: string,
  offset: number,
  db: IDBDatabase,
): Promise<void> {
  increaseBusyCounter();
  console.log(busyCounter);

  try {
    const result: FetchTransactionsResponse = await downloadTransactions(
      address,
      offset,
      rs_FullDownloadsBatchSize + 10,
    );
    console.log(
      `Processing full download(offset = ${offset}, size = ${rs_FullDownloadsBatchSize}) for: ${address}`,
    );

    if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
      await setDownloadStatus(address, 'true', db);
      console.log(busyCounter);
      return;
    }

    await addData(address, result.transactions, db);
    await downloadAllForAddress(address, offset + rs_FullDownloadsBatchSize, db);
  } catch (e) {
    console.error(e);
  } finally {
    decreaseBusyCounter();
    console.log(busyCounter);
  }
}
