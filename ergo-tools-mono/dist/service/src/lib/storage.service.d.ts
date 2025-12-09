type StoreCache = {
    all?: any[];
    byId?: Map<IDBValidKey | IDBKeyRange, any>;
};
declare const GLOBAL_CACHE_KEY = "__StorageServiceCache_v1__";
declare class StorageService<T> {
    db: IDBDatabase;
    private cacheMap;
    constructor(db: IDBDatabase);
    private getStoreCache;
    getData<S = unknown>(storeName: string): Promise<T[] | S[]>;
    getDataById(storeName: string, id: IDBValidKey | IDBKeyRange): Promise<T | null>;
    addData<S = unknown>(storeName: string, data: T[] | S[]): Promise<void>;
    deleteData(storeName: string, keys: IDBValidKey | IDBKeyRange | Array<IDBValidKey | IDBKeyRange>): Promise<void>;
}
