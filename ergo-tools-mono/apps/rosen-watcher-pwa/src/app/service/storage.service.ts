import { Injectable } from '@angular/core';
import { Input, rs_ActivePermit_Key, rs_ActivePermitTxStoreName, rs_Address_Key, rs_AddressDataStoreName, rs_DbName, rs_DbVersion, rs_Download_Key, rs_DownloadStatusStoreName, rs_DownloadStoreName, rs_Input_Key, rs_InputsStoreName, rs_OpenBoxesStoreName, rs_PerfTx_Key, rs_PerfTxStoreName, rs_Permit_Key, rs_PermitTxStoreName, rs_ReportsStoreName, rs_WatcherReportsStoreName } from '@ergo-tools/service';
import { Address } from '@ergo-tools/service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  dbPromise!: Promise<IDBDatabase>;
  inputsCache: Input[] = [];

  constructor() {
    this.initIndexedDB();
  }

  async initIndexedDB(): Promise<void> {


    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(rs_DbName, rs_DbVersion);

      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;


          this.recreateObjectStore(db, rs_InputsStoreName, rs_Input_Key);
          this.recreateObjectStore(db, rs_PerfTxStoreName, rs_PerfTx_Key);
          this.recreateObjectStore(db, rs_PermitTxStoreName, rs_Permit_Key);
          this.recreateObjectStore(db, rs_WatcherReportsStoreName);
          this.recreateObjectStore(
            db,
            rs_ActivePermitTxStoreName,
            rs_ActivePermit_Key,
          );
          this.recreateObjectStore(
            db,
            rs_DownloadStoreName,
            rs_Download_Key,
          );


          const store = this.recreateObjectStore(
            db,
            rs_ReportsStoreName,
            rs_PerfTx_Key,
          );

          store.createIndex("chainType", "chainType", {
            unique: false,
          });

          if (!db.objectStoreNames.contains(rs_AddressDataStoreName)) {
            db.createObjectStore(rs_AddressDataStoreName, {
              keyPath: rs_Address_Key,
            });
          }

          this.recreateObjectStore(
            db,
            rs_DownloadStatusStoreName,
            rs_Address_Key,
          );
          this.recreateObjectStore(
            db,
            rs_OpenBoxesStoreName,
            rs_Address_Key,
          );
        

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

  private recreateObjectStore(
    db: IDBDatabase,
    storeName: string,
    keyPath: string | string[] | null = null,
  ): IDBObjectStore {
    if (db.objectStoreNames.contains(storeName)) {
      db.deleteObjectStore(storeName);
    }
    if(keyPath === null) {
      return db.createObjectStore(storeName);
    }
    else{
      return db.createObjectStore(storeName, { keyPath });
    }
  }

  async clearAddressStore(): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve) => {
      const transaction = db.transaction(
        [rs_AddressDataStoreName],
        'readwrite',
      );
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
    const rawData = await this.getData<{
      address: string;
      chainType: string | null;
      active?: boolean;
    }>(rs_AddressDataStoreName);

    const addresses: Address[] = rawData.map(
      (obj) => new Address(obj.address, obj.chainType, obj.active ?? true),
    );

    return addresses;
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

  async putAddressData(addressData: Address[] | undefined): Promise<void> {
    if (!addressData) {
      return;
    }
    await this.clearAddressStore();
    const db = await this.getDB();

    addressData.forEach((a) => {
      const transaction = db.transaction(
        [rs_AddressDataStoreName],
        'readwrite',
      );
      const objectStore = transaction.objectStore(rs_AddressDataStoreName);
      a.Address = a.address;
      objectStore.put(a);
    });
  }
}
