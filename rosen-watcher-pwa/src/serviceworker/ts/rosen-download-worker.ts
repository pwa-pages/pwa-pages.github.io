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
}

interface Input {
  boxId: string;
  outputAddress: string;
  inputDate?: Date;
  assets?: Asset[]; // Replace with actual Asset structure
  outputCreatedAt?: Date;
  address?: string;
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
  outputCreatedAt: Date;
  address?: string;
}

interface AddressData {
  address: string;
}

interface DownloadStatus {
  address: string;
  status: string;
}

// Constants
const inputsStoreName = 'inputBoxes';
const addressDataStoreName = 'addressData';
const downloadStatusStoreName = 'downloadStatusStore'; // New store for download status flags
const initialNDownloads = 50;
const fullDownloadsBatchSize = 200;
const startFrom: Date = new Date('2024-01-01');
const dbName = 'rosenDatabase_1.1.5';

let busyCounter = 0;

// Service Worker Event Listener
self.addEventListener('message', async (event: MessageEvent) => {
  const data: MessageEventData = event.data;

  console.log(`Rosen service worker received event of type ${data.type}`);

  if (data && data.type === 'StatisticsScreenLoaded') {
    console.log(
      'Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain',
    );

    console.log(getChainType('aaaa'));
    try {
      const db: IDBDatabase = await initIndexedDB();
      await downloadForAddresses(db);
    } catch (error) {
      console.error('Error initializing IndexedDB or downloading addresses:', error);
    }
  }
});

// IndexedDB Initialization
async function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName, 18);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;

      if (db.objectStoreNames.contains(inputsStoreName)) {
        db.deleteObjectStore(inputsStoreName);
      }
      db.createObjectStore(inputsStoreName, { keyPath: ['boxId', 'outputAddress'] });

      if (!db.objectStoreNames.contains(addressDataStoreName)) {
        db.createObjectStore(addressDataStoreName, { keyPath: 'address' });
      }

      // Create the new store for download status
      if (!db.objectStoreNames.contains(downloadStatusStoreName)) {
        db.createObjectStore(downloadStatusStoreName, { keyPath: 'address' });
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
async function sendMessageToClients(message: { type: string }): Promise<void> {
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
    const transaction: IDBTransaction = db.transaction([inputsStoreName], 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore(inputsStoreName);

    const putPromises: Promise<void>[] = transactions.flatMap((item: TransactionItem) =>
      item.inputs.map((input: Input) => {
        input.outputAddress = address;
        input.inputDate = new Date(item.timestamp);

        const dbInput: DbInput = {
          outputAddress: input.outputAddress,
          inputDate: input.inputDate,
          boxId: input.boxId,
          assets: input.assets || [],
          outputCreatedAt: input.outputCreatedAt ? new Date(item.outputCreatedAt) : new Date(),
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
      .then(() => {
        sendMessageToClients({ type: 'InputsStoredToDb' });
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
    if (inputDate < startFrom) {
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
    const transaction: IDBTransaction = db.transaction([downloadStatusStoreName], 'readonly');
    const objectStore: IDBObjectStore = transaction.objectStore(downloadStatusStoreName);
    const request: IDBRequest = objectStore.get(address);

    request.onsuccess = () => resolve((request.result as DownloadStatus)?.status || 'false');
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Set Download Status for Address in IndexedDB
async function setDownloadStatus(address: string, status: string, db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction([downloadStatusStoreName], 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore(downloadStatusStoreName);
    const request: IDBRequest = objectStore.put({ address, status });

    request.onsuccess = () => resolve();
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Download for Address
async function downloadForAddress(address: string, db: IDBDatabase): Promise<void> {
  increaseBusyCounter();
  console.log(busyCounter);

  try {
    const result: FetchTransactionsResponse = await downloadTransactions(
      address,
      0,
      initialNDownloads,
    );
    console.log(`Processing initial download(size = ${initialNDownloads}) for: ${address}`);

    const itemsz: number = result.transactions.length;
    let halfBoxId = '';

    if (itemsz > initialNDownloads / 2) {
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
    } else if (itemsz >= initialNDownloads) {
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
    const transaction: IDBTransaction = db.transaction([inputsStoreName], 'readonly');
    const objectStore: IDBObjectStore = transaction.objectStore(inputsStoreName);
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
      fullDownloadsBatchSize + 10,
    );
    console.log(
      `Processing full download(offset = ${offset}, size = ${fullDownloadsBatchSize}) for: ${address}`,
    );

    if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
      await setDownloadStatus(address, 'true', db);
      console.log(busyCounter);
      return;
    }

    await addData(address, result.transactions, db);
    await downloadAllForAddress(address, offset + fullDownloadsBatchSize, db);
  } catch (e) {
    console.error(e);
  } finally {
    decreaseBusyCounter();
    console.log(busyCounter);
  }
}

// Download for All Addresses
async function downloadForAddresses(db: IDBDatabase): Promise<void> {
  try {
    const addresses: AddressData[] = await getData<AddressData>(addressDataStoreName, db); // Fetch all addresses from the IndexedDB

    const downloadPromises: Promise<void>[] = addresses.map(async (addressObj: AddressData) => {
      await downloadForAddress(addressObj.address, db); // Initiate download for each address
    });

    await Promise.all(downloadPromises); // Wait for all download operations to complete
  } catch (e) {
    console.error('Error downloading for addresses:', e);
  }
}
