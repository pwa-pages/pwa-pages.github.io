import { Injectable } from '@angular/core';
import { EventService, EventType } from './event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Transaction } from '../models/transaction';
import { Input } from '../models/input';
import { Address } from '../models/address';

interface TransactionResponse {
  items: Transaction[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class DownloadDataService {
  inputsStoreName = 'inputBoxes';
  addressDataStoreName = 'addressData';
  readonly initialNDownloads: number = 50;
  readonly fullDownloadsBatchSize: number = 200;
  readonly startFrom: Date = new Date('2024-01-01');
  dbName = 'rosenDatabase_1.1.5';

  dbPromise: Promise<IDBDatabase>;
  busyCounter = 0;

  constructor(
    private eventService: EventService<string>,
    private snackBar: MatSnackBar,
  ) {
    this.dbPromise = this.initIndexedDB();
  }
  async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, 15);

      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (db.objectStoreNames.contains(this.inputsStoreName)) {
          db.deleteObjectStore(this.inputsStoreName);
        }
        
        db.createObjectStore(this.inputsStoreName, { keyPath: ['boxId', 'outputAddress'] });

        if (!db.objectStoreNames.contains(this.addressDataStoreName)) {
          db.createObjectStore(this.addressDataStoreName, {
            keyPath: 'address',
          });
        }
      };

      request.onsuccess = async (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        resolve(db);
      };

      request.onerror = (event: Event) => {
        console.error('Error opening IndexedDB:', event.target);
        reject(event.target);
      };
    });
  }
  async getDB(): Promise<IDBDatabase> {
    return await this.dbPromise;
  }

  private IncreaseBusyCounter(): void {
    if (this.busyCounter === 0) {
      this.eventService.sendEvent(EventType.StartFullDownload);
    }
    this.busyCounter++;
  }

  private DecreasBusyCounter(): void {
    this.busyCounter--;
    if (this.busyCounter === 0) {
      this.eventService.sendEvent(EventType.EndFullDownload);
    }
  }

  private async fetchTransactions(url: string): Promise<TransactionResponse> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned code: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      throw error;
    }
  }
  async getAddressData(): Promise<Address[]> {
    return await this.getData<Address>(this.addressDataStoreName);
  }

  private async getData<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');

      const objectStore = transaction.objectStore(storeName);

      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event: Event) => {
        reject(event.target);
      };
    });
  }

  private async downloadTransactions(
    address: string,
    offset = 0,
    limit = 500,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);

    this.eventService.sendEventWithData(EventType.StartDownload, url);

    const response = await this.fetchTransactions(url);
    const result = {
      transactions: response.items,
      total: response.total,
    };

    for (const item of response.items) {
      const inputDate = new Date(item.timestamp);
      if (inputDate < this.startFrom) {
        this.eventService.sendEventWithData(EventType.EndDownload, url);
        return result; // Return if a transaction is found before the startFrom date
      }
    }

    this.eventService.sendEventWithData(EventType.EndDownload, url);
    return result;
  }

  private async downloadAllForAddress(address: string, offset: number) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    try {
      const result = await this.downloadTransactions(
        address,
        offset,
        this.fullDownloadsBatchSize + 10,
      );

      console.log(
        'Processing all download(offset = ' +
          offset +
          ', size = ' +
          this.fullDownloadsBatchSize +
          ') for: ' +
          address,
      );

      if (!result.transactions || result.transactions.length === 0 || offset > 100000) {
        localStorage.setItem('fullDownloadAddress_' + address, 'true');

        console.log(this.busyCounter);
        return;
      }

      await this.addData(address, result.transactions);
      await this.downloadAllForAddress(address, offset + this.fullDownloadsBatchSize);
    } catch (e) {
      console.error(e);
    } finally {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
    }
  }

  public async downloadForAddresses(hasAddressParams: boolean) {
    try {
      const addresses = await this.getAddressData();

      const downloadPromises = addresses.map(async (address) => {
        await this.downloadForAddress(address.address, hasAddressParams);
      });

      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    }
  }

  async addData(address: string, transactions: Transaction[]): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.inputsStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.inputsStoreName);

      transactions.forEach((item: Transaction) => {
        item.inputs.forEach(async (input: Input) => {
          input.outputAddress = address;
          input.inputDate = new Date(item.timestamp);

          const dbInput: Input = {
            outputAddress: input.outputAddress,
            inputDate: input.inputDate,
            boxId: input.boxId,
            assets: input.assets,
            outputCreatedAt: input.outputCreatedAt,
            address: input.address,
          };

          const request = objectStore.put(dbInput);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = (event: Event) => {
            reject(event.target);
          };
        });
      });

      this.eventService.sendEvent(EventType.InputsStoredToDb);
    });
  }

  async getDataByBoxId(boxId: string, addressId: string): Promise<Input | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.inputsStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.inputsStoreName);
      const request = objectStore.get([boxId, addressId]) as IDBRequest;

      request.onsuccess = () => {
        if (!request.result || request.result.outputAddress != addressId) {
          resolve(null);
        } else {
          resolve(request.result as Input);
        }
      };

      request.onerror = (event: Event) => {
        reject(event.target);
      };
    });
  }

  public async downloadForAddress(address: string, hasAddressParams: boolean) {
    this.IncreaseBusyCounter();
    console.log(this.busyCounter);

    try {
      const result = await this.downloadTransactions(address, 0, this.initialNDownloads);

      console.log(
        'Processing initial download(size = ' + this.initialNDownloads + ') for: ' + address,
      );

      const itemsz = result.transactions.length;
      let halfBoxId = '';

      if (itemsz > this.initialNDownloads / 2) {
        for (let i = Math.floor(itemsz / 2); i < itemsz; i++) {
          const item = result.transactions[i];

          for (const input of item.inputs) {
            if (input.boxId && halfBoxId === '') {
              halfBoxId = input.boxId;
            }
          }
        }
      }
      const boxId = await this.getDataByBoxId(halfBoxId, address);

      console.log('add bunch of data');
      await this.addData(address, result.transactions);

      if (boxId && localStorage.getItem('fullDownloadAddress_' + address) == 'true') {
        console.log(
          'Found existing boxId in db for download for: ' + address + ',no need to download more.',
        );
      } else if (itemsz >= this.initialNDownloads) {
        localStorage.setItem('fullDownloadAddress_' + address, 'false');
        console.log("Downloading all tx's for : " + address);
        await this.downloadAllForAddress(address, 0);
      }
    } catch (e) {
      if (hasAddressParams) {
        this.snackBar.open(
          'Some download(s) failed, check your addresses, not all of them might be correct, or service may have issues',
          'Close',
          {
            duration: 5000,
            panelClass: ['custom-snackbar'],
          },
        );
      }
      console.error(e);
    } finally {
      this.DecreasBusyCounter();
      console.log(this.busyCounter);
    }
  }
}
