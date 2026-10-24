import { Injectable } from '@angular/core';
import { Input } from '@ergo-tools/service';
import { Address } from '@ergo-tools/service';
import { ErgSettings } from '@ergo-tools/service';

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
      const request = window.indexedDB.open(ErgSettings.rs_dbName(), ErgSettings.rs_DbVersion());

      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        this.recreateObjectStore(db, ErgSettings.rs_InputsStoreName(), ErgSettings.rs_Input_Key());
        this.recreateObjectStore(db, ErgSettings.rs_PerfTxStoreName(), ErgSettings.rs_PerfTx_Key());
        this.recreateObjectStore(db, ErgSettings.rs_PermitTxStoreName(), ErgSettings.rs_Permit_Key());
        this.recreateObjectStore(
          db,
          ErgSettings.rs_ActivePermitTxStoreName(),
          ErgSettings.rs_ActivePermit_Key(),
        );

        const store = this.recreateObjectStore(
          db,
          ErgSettings.rs_ReportsStoreName(),
          ErgSettings.rs_PerfTx_Key(),
        );

        store.createIndex("chainType", "chainType", {
          unique: false,
        });

        if (!db.objectStoreNames.contains(ErgSettings.rs_AddressDataStoreName())) {
          db.createObjectStore(ErgSettings.rs_AddressDataStoreName(), {
            keyPath: ErgSettings.rs_Address_Key(),
          });
        }

        this.recreateObjectStore(
          db,
          ErgSettings.rs_DownloadStatusStoreName(),
          ErgSettings.rs_Address_Key(),
        );
        this.recreateObjectStore(
          db,
          ErgSettings.rs_OpenBoxesStoreName(),
          ErgSettings.rs_Address_Key(),
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
    keyPath: string | string[],
  ): IDBObjectStore {
    if (db.objectStoreNames.contains(storeName)) {
      db.deleteObjectStore(storeName);
    }
    return db.createObjectStore(storeName, { keyPath });
  }

  async clearAddressStore(): Promise<void> {
    const db = await this.getDB();
    return new Promise<void>((resolve) => {
      const transaction = db.transaction(
        [ErgSettings.rs_AddressDataStoreName()],
        'readwrite',
      );
      const objectStore = transaction.objectStore(ErgSettings.rs_AddressDataStoreName());
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
      const transaction = db.transaction([ErgSettings.rs_InputsStoreName()], 'readwrite');
      const objectStore = transaction.objectStore(ErgSettings.rs_InputsStoreName());
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
    this.inputsCache = await this.getData<Input>(ErgSettings.rs_InputsStoreName());
    return this.inputsCache;
  }
  async getAddressData(): Promise<Address[]> {
    const rawData = await this.getData<{
      address: string;
      chainType: string | null;
      active?: boolean;
    }>(ErgSettings.rs_AddressDataStoreName());

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
        [ErgSettings.rs_AddressDataStoreName()],
        'readwrite',
      );
      const objectStore = transaction.objectStore(ErgSettings.rs_AddressDataStoreName());
      a.Address = a.address;
      objectStore.put(a);
    });
  }
}
