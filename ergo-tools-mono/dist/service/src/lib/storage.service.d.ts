type StoreCache<T> = {
    byId: Map<IDBValidKey, T>;
    hydrated: boolean;
};
declare const GLOBAL_CACHE_KEY = "__StorageServiceCache_v2__";
declare class StorageService<T> {
    db: IDBDatabase;
    private cacheMap;
    constructor(db: IDBDatabase);
    private getStoreCache;
    private getKey;
    getData<S>(storeName: string): Promise<T[] | S[]>;
    getDataById(storeName: string, id: IDBValidKey): Promise<T | null>;
    addData<S = T>(storeName: string, data: S[]): Promise<void>;
    deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void>;
}
