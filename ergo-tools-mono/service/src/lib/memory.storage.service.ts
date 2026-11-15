import { IStorageService } from "./constants";

export class MemoryStorageService<T> implements IStorageService{
  private getMemoryStore(): Record<string, any> {
    const g = globalThis as any;
    if (!g.__storageServiceStore) {
      g.__storageServiceStore = {};
    }
    return g.__storageServiceStore;
  }

  private generateKey(storeName: string, key: unknown): string {
    if (Array.isArray(key)) {
      return storeName + ':' + key.map(k => String(k)).join(',');
    }
    return storeName + ':' + String(key);
  }

  async getData<S>(storeName: string): Promise<S[]> {
    return new Promise((resolve) => {

      const store = this.getMemoryStore();
      const prefix = storeName + ':';
      const result: (T | S)[] = Object.keys(store)
        .filter(key => key.startsWith(prefix))
        .map(key => store[key]);


      resolve(result as S[]);
    });
  }

  async getDataById<S>(storeName: string, id: unknown): Promise<S | null> {
    return new Promise((resolve) => {
      const key = this.generateKey(storeName, id);
      const store = this.getMemoryStore();
      resolve(store[key] ?? null);
    });
  }

  async addData<S>(
    storeName: string,
    data: S[],
    key?: IDBValidKey,
  ): Promise<void> {
    return new Promise((resolve) => {
      const store = this.getMemoryStore();
      data.forEach(item => {
        const id = key ?? (item as any).id ?? Math.random().toString(36).slice(2); // fallback id if missing
        const storageKey = this.generateKey(storeName, id);
        store[storageKey] = item;
      });
      resolve();
    });
  }

  async deleteData(storeName: string, keys: unknown | unknown[]): Promise<void> {
    const arr = Array.isArray(keys) ? keys : [keys];
    return new Promise((resolve) => {
      const store = this.getMemoryStore();
      arr.forEach(key => {
        const storageKey = this.generateKey(storeName, key);
        delete store[storageKey];
      });
      resolve();
    });
  }
}
