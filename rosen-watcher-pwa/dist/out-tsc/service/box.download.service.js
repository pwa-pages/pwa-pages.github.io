"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference lib="webworker" />
// Define store names and database details
const inputsStoreName = 'inputBoxes';
const addressDataStoreName = 'addressData';
const downloadStatusStoreName = 'downloadStatusStore'; // New store for download status flags
const initialNDownloads = 50;
const fullDownloadsBatchSize = 200;
const startFrom = new Date('2024-01-01');
const dbName = 'rosenDatabase_1.1.5';
let busyCounter = 0;
self.addEventListener('message', async (event) => {
    console.log('Rosen service worker received event of type ' + event.data.type);
    if (event.data && event.data.type === 'StatisticsScreenLoaded') {
        console.log('Rosen service worker received StatisticsScreenLoaded initiating syncing of data by downloading from blockchain');
        const db = await initIndexedDB();
        await downloadForAddresses(db);
    }
});
// IndexedDB Initialization
async function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 18);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
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
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event.target);
            reject(event.target);
        };
    });
}
// Send messages to clients (active pages)
async function sendMessageToClients(message) {
    console.log(message);
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
        client.postMessage(message);
    }
}
// Busy Counter
function increaseBusyCounter() {
    if (busyCounter === 0) {
        sendMessageToClients({ type: 'StartFullDownload' });
    }
    busyCounter++;
}
function decreaseBusyCounter() {
    busyCounter--;
    if (busyCounter === 0) {
        sendMessageToClients({ type: 'EndFullDownload' });
    }
}
// Fetch Transactions
async function fetchTransactions(url) {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Server returned code: ${response.status}`);
        return await response.json();
    }
    catch (error) {
        console.error(`An error occurred: ${error}`);
        throw error;
    }
}
// Add Data to IndexedDB
async function addData(address, transactions, db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([inputsStoreName], 'readwrite');
        const objectStore = transaction.objectStore(inputsStoreName);
        const putRequests = transactions.flatMap((item) => item.inputs.map((input) => {
            input.outputAddress = address;
            input.inputDate = new Date(item.timestamp);
            const dbInput = {
                outputAddress: input.outputAddress,
                inputDate: input.inputDate,
                boxId: input.boxId,
                assets: input.assets,
                outputCreatedAt: input.outputCreatedAt,
                address: input.address,
            };
            return new Promise((putResolve, putReject) => {
                const request = objectStore.put(dbInput);
                request.onsuccess = () => putResolve();
                request.onerror = (event) => putReject(event);
            });
        }));
        Promise.all(putRequests)
            .then(() => {
            sendMessageToClients({ type: 'InputsStoredToDb' });
            resolve();
        })
            .catch(reject);
    });
}
// Download Transactions
async function downloadTransactions(address, offset = 0, limit = 500) {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
    console.log('Downloading from: ' + url);
    sendMessageToClients({ type: 'StartDownload' });
    const response = await fetchTransactions(url);
    const result = {
        transactions: response,
        total: response.length,
    };
    for (const item of response) {
        const inputDate = new Date(item.timestamp);
        if (inputDate < startFrom) {
            sendMessageToClients({ type: 'EndDownload' });
            return result;
        }
    }
    sendMessageToClients({ type: 'EndDownload' });
    return result;
}
// Get Data from IndexedDB
async function getData(storeName, db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target);
    });
}
// Get Download Status for Address from IndexedDB
async function getDownloadStatus(address, db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([downloadStatusStoreName], 'readonly');
        const objectStore = transaction.objectStore(downloadStatusStoreName);
        const request = objectStore.get(address);
        request.onsuccess = () => resolve(request.result?.status || 'false');
        request.onerror = (event) => reject(event.target);
    });
}
// Set Download Status for Address in IndexedDB
async function setDownloadStatus(address, status, db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([downloadStatusStoreName], 'readwrite');
        const objectStore = transaction.objectStore(downloadStatusStoreName);
        const request = objectStore.put({ address: address, status: status });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target);
    });
}
// Download for Address
async function downloadForAddress(address, db) {
    increaseBusyCounter();
    console.log(busyCounter);
    try {
        const result = await downloadTransactions(address, 0, initialNDownloads);
        console.log(`Processing initial download(size = ${initialNDownloads}) for: ${address}`);
        const itemsz = result.transactions.length;
        let halfBoxId = '';
        if (itemsz > initialNDownloads / 2) {
            for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
                const item = result.transactions[i];
                for (const input of item.inputs) {
                    if (input.boxId && halfBoxId === '') {
                        halfBoxId = input.boxId;
                    }
                }
            }
        }
        const boxId = await getDataByBoxId(halfBoxId, address, db);
        console.log('Add bunch of data');
        await addData(address, result.transactions, db);
        const downloadStatus = await getDownloadStatus(address, db);
        if (boxId && downloadStatus === 'true') {
            console.log(`Found existing boxId in db for ${address}, no need to download more.`);
        }
        else if (itemsz >= initialNDownloads) {
            await setDownloadStatus(address, 'false', db);
            console.log("Downloading all tx's for : " + address);
            await downloadAllForAddress(address, 0, db);
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        decreaseBusyCounter();
        console.log(busyCounter);
    }
}
// Get Data by BoxId from IndexedDB
async function getDataByBoxId(boxId, addressId, db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([inputsStoreName], 'readonly');
        const objectStore = transaction.objectStore(inputsStoreName);
        const request = objectStore.get([boxId, addressId]);
        request.onsuccess = () => {
            if (!request.result || request.result.outputAddress !== addressId) {
                resolve(null);
            }
            else {
                resolve(request.result);
            }
        };
        request.onerror = (event) => reject(event.target);
    });
}
// Download All for Address (recursive)
async function downloadAllForAddress(address, offset, db) {
    increaseBusyCounter();
    console.log(busyCounter);
    try {
        const result = await downloadTransactions(address, offset, fullDownloadsBatchSize + 10);
        console.log(`Processing full download(offset = ${offset}, size = ${fullDownloadsBatchSize}) for: ${address}`);
        if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
            await setDownloadStatus(address, 'true', db);
            console.log(busyCounter);
            return;
        }
        await addData(address, result.transactions, db);
        await downloadAllForAddress(address, offset + fullDownloadsBatchSize, db);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        decreaseBusyCounter();
        console.log(busyCounter);
    }
}
// Download for All Addresses
async function downloadForAddresses(db) {
    try {
        const addresses = await getData(addressDataStoreName, db); // Fetch all addresses from the IndexedDB
        const downloadPromises = addresses.map(async (addressObj) => {
            await downloadForAddress(addressObj.address, db); // Initiate download for each address
        });
        await Promise.all(downloadPromises); // Wait for all download operations to complete
    }
    catch (e) {
        console.error('Error downloading for addresses:', e);
    }
}
//# sourceMappingURL=box.download.service.js.map