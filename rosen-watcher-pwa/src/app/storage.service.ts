import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  dbName = 'ergoDatabase14';
  storeName = 'inputBoxes';
  dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initIndexedDB();
  }

  initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore(this.storeName, { keyPath: 'boxId' });
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        resolve(db);
      };

      request.onerror = (event: any) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getDB(): Promise<IDBDatabase> {
    return await this.dbPromise;
  }

  async getData(): Promise<any[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }

  async addData(address: string, newData: any): Promise<void> {
    const db = await this.getDB();
    newData.outputAddress = address;

    

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(newData);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }
}
