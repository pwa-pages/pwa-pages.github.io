import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  dbName = 'ergoDatabase3';
  storeName = 'inputBoxes';
  db!: IDBDatabase;

  constructor() {
    this.initIndexedDB();
  }

  initIndexedDB() {
    const request = window.indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result;
      this.db.createObjectStore(this.storeName, { keyPath: 'boxId' });
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    };

    request.onerror = (event: any) => {
      console.error('Error opening IndexedDB:', event.target.error);
    };
  }

  getData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
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

  addData(newData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
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
