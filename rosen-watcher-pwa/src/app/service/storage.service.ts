import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  dbName = 'rosenDatabase_1.1.5';
  storeName = 'inputBoxes';
  dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initIndexedDB();
  }

  async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            db.createObjectStore(this.storeName, { keyPath: 'boxId' });
        };

        request.onsuccess = async (event: any) => {
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

  async clearDB(): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear()

      request.onsuccess = () => {
        console.log('IndexedDB cleared successfully.');
        resolve();
      };

      request.onerror = (event: any) => {
        console.error('Error clearing IndexedDB:', (event.target as any).errorCode);
        resolve();
      };
    });
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

  async getDataByBoxId(boxId: string): Promise<any> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(boxId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }



  async deleteData(address: string, boxId: any): Promise<void> {
    const db = await this.getDB();
    

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(boxId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }

  async addData(address: string, item: any, input: any): Promise<void> {
    const db = await this.getDB();
    input.outputAddress = address;
    input.inputDate = new Date(item.timestamp);
    
    
    var dbInput:any = {
      outputAddress: input.outputAddress,
      inputDate: input.inputDate,
      boxId: input.boxId,
      assets: input.assets,
      outputCreatedAt: input.outputCreatedAt,
      address: input.address

    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(dbInput);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }
}