import { Injectable } from '@angular/core';
import { Input } from '../models/input';
import { Address } from '../models/address';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  dbName = 'rosenDatabase_1.1.5';
  inputsStoreName = 'inputBoxes';
  addressDataStoreName = 'addressData';
  dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initIndexedDB();
  }

  async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, 15);

      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        db.deleteObjectStore(this.inputsStoreName);
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
    return await this.getData<Input>(this.inputsStoreName);
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

  async putAddressData(addressData: Address[]): Promise<void> {
    await this.clearAddressStore();
    const db = await this.getDB();

    addressData.forEach((a) => {
      const transaction = db.transaction([this.addressDataStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.addressDataStoreName);
      objectStore.put(a);
    });
  }
}
