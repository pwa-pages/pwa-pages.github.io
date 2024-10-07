import { Injectable } from '@angular/core';
import { Input } from '../../service/ts/models/input';
import { Address } from '../../service/ts/models/address';
import '../../serviceworker/ts/constants';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  dbPromise: Promise<IDBDatabase>;
  inputsCache: Input[] = [];

  constructor() {
    this.dbPromise = this.initIndexedDB();
  }

  async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(rs_DbName, rs_DbVersion);

      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (db.objectStoreNames.contains(rs_InputsStoreName)) {
          db.deleteObjectStore(rs_InputsStoreName);
        }
        db.createObjectStore(rs_InputsStoreName, { keyPath: rs_Input_Key });

        if (!db.objectStoreNames.contains(rs_AddressDataStoreName)) {
          db.createObjectStore(rs_AddressDataStoreName, {
            keyPath: rs_Address_Key,
          });
        }

        if (!db.objectStoreNames.contains(rs_DownloadStatusStoreName)) {
          db.createObjectStore(rs_DownloadStatusStoreName, {
            keyPath: rs_Address_Key,
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
      const transaction = db.transaction([rs_AddressDataStoreName], 'readwrite');
      const objectStore = transaction.objectStore(rs_AddressDataStoreName);
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
      const transaction = db.transaction([rs_InputsStoreName], 'readwrite');
      const objectStore = transaction.objectStore(rs_InputsStoreName);
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

  async getInputs(): Promise<Input[]> {
    console.log('Getting inputs from database');
    this.inputsCache = await this.getData<Input>(rs_InputsStoreName);
    return this.inputsCache;
  }

  async getAddressData(): Promise<Address[]> {
    return await this.getData<Address>(rs_AddressDataStoreName);
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

  async putAddressData(addressData: Address[]): Promise<void> {
    await this.clearAddressStore();
    const db = await this.getDB();

    addressData.forEach((a) => {
      const transaction = db.transaction([rs_AddressDataStoreName], 'readwrite');
      const objectStore = transaction.objectStore(rs_AddressDataStoreName);
      objectStore.put(a);
    });
  }
}
