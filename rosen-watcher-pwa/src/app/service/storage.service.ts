import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  dbName = 'rosenDatabase_1.1.5';
  inputsStoreName = 'inputBoxes';
  addressDataStoreName = 'addressData';
  dbPromise: Promise<IDBDatabase>;
  inputsCache: any[] = [];
   updateCache: boolean = true;

  constructor() {
    this.dbPromise = this.initIndexedDB();
  }

  async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      
      const request = window.indexedDB.open(this.dbName, 2);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.inputsStoreName)) {
          db.createObjectStore(this.inputsStoreName, { keyPath: 'boxId' });
        }

        if (!db.objectStoreNames.contains(this.addressDataStoreName)) {
          db.createObjectStore(this.addressDataStoreName, { keyPath: 'address' });
        }
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

  async clearInputsStore(): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([this.inputsStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.inputsStoreName);
      const request = objectStore.clear()

      this.updateCache = true;
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

  async getInputs(): Promise<any[]> {
    if(this.inputsCache && this.inputsCache.length > 0 && !this.updateCache){
      return new Promise<any[]>((resolve, reject) => {
        console.log('Getting inputs from cache');
        resolve(this.inputsCache);
      });
    }
    this.updateCache = false;
    console.log('Getting inputs from database');
    this.inputsCache = await this.getData(this.inputsStoreName);
    return this.inputsCache;
  }

  async getAddressData(): Promise<any[]> {
    return await this.getData(this.addressDataStoreName);
  }

  private async getData(storeName: string): Promise<any[]> {
    
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {

      
      const transaction = db.transaction([storeName], 'readonly');
      
      const objectStore = transaction.objectStore(storeName);

      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
        
      };

      

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
    
  }

  async getDataByBoxId(boxId: string, addressId: string): Promise<any> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.inputsStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.inputsStoreName);
      const request = objectStore.get(boxId);

      request.onsuccess = () => {
        if(!request.result || request.result.outputAddress != addressId){
          resolve(null);  
          
        }
        else{
          resolve(request.result);
        }
        
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }


  async putAddressData(addressData: any[]): Promise<void> {
    const db = await this.getDB();

    addressData.forEach(a => {
      const transaction = db.transaction([this.addressDataStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.addressDataStoreName);
      objectStore.put(a);
      
    });
  }

  async addData(address: string, item: any, input: any): Promise<void> {
    const db = await this.getDB();
    input.outputAddress = address;
    input.inputDate = new Date(item.timestamp);


    var dbInput: any = {
      outputAddress: input.outputAddress,
      inputDate: input.inputDate,
      boxId: input.boxId,
      assets: input.assets,
      outputCreatedAt: input.outputCreatedAt,
      address: input.address

    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.inputsStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.inputsStoreName);
      const request = objectStore.put(dbInput);
      this.updateCache = true;
      request.onsuccess = () => {
        
        resolve();
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }
}
