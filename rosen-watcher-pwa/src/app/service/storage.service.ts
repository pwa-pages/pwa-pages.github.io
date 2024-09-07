import { Injectable } from '@angular/core';
import { EventService, EventType } from './event.service';
import { Input } from '../models/input';
import { Transaction } from '../models/transaction';
import { Address } from '../models/address';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  dbName = 'rosenDatabase_1.1.5';
  inputsStoreName = 'inputBoxes';
  addressDataStoreName = 'addressData';
  dbPromise: Promise<IDBDatabase>;
  inputsCache: Input[] = [];
  updateCache = true;

  constructor(private eventService: EventService<string>) {
    this.dbPromise = this.initIndexedDB();
  }

  async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, 15);

      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        db.deleteObjectStore(this.inputsStoreName);


        db.createObjectStore(this.inputsStoreName, { keyPath: ['boxId' , 'outputAddress']});


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

  async clearAddressStore(): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve) => {
      const transaction = db.transaction([this.addressDataStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.addressDataStoreName);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('IndexedDB cleared successfully.');
        resolve();
      };

      request.onerror = (event: Event) => {
        console.error('Error clearing IndexedDB:', event.target);
        resolve();
      };
    });
  }

  async clearInputsStore(): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve) => {
      const transaction = db.transaction([this.inputsStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.inputsStoreName);
      const request = objectStore.clear();

      this.updateCache = true;
      request.onsuccess = () => {
        console.log('IndexedDB cleared successfully.');
        resolve();
      };

      request.onerror = (event: Event) => {
        console.error('Error clearing IndexedDB:', event.target);
        resolve();
      };
    });
  }

  async getInputs(): Promise<Input[]> {
    if (this.inputsCache && this.inputsCache.length > 0 && !this.updateCache) {
      return new Promise<Input[]>((resolve) => {
        console.log('Getting inputs from cache');
        resolve(this.inputsCache);
      });
    }
    this.updateCache = false;
    console.log('Getting inputs from database');
    this.inputsCache = await this.getData<Input>(this.inputsStoreName);
    return this.inputsCache;
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

  async getDataByBoxId(boxId: string, addressId: string): Promise<Input | null> {

    if(boxId == 'f464d3cf1c30096f2177f670c0ea6986d0faa5bc3eac6c6bdb0d36b320b1f280'){
      console.log(boxId);
    }
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.inputsStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.inputsStoreName);
      const request = objectStore.get([boxId, addressId]) as IDBRequest;

      request.onsuccess = () => {

        if(boxId == 'f464d3cf1c30096f2177f670c0ea6986d0faa5bc3eac6c6bdb0d36b320b1f280'){
          console.log(boxId);
        }

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

  async putAddressData(addressData: Address[]): Promise<void> {
    await this.clearAddressStore();
    const db = await this.getDB();

    addressData.forEach((a) => {
      const transaction = db.transaction([this.addressDataStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.addressDataStoreName);
      objectStore.put(a);
    });
  }

  async addData(address: string, transactions: Transaction[]): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
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

          const transaction = db.transaction([this.inputsStoreName], 'readwrite');
          const objectStore = transaction.objectStore(this.inputsStoreName);
          const request = objectStore.put(dbInput);
          this.updateCache = true;
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
}
