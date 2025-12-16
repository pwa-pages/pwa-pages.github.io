declare class StorageService<T> {
    db: IDBDatabase;
    constructor(db: IDBDatabase);
    getData<S>(storeName: string): Promise<T[] | S[]>;
    getDataById(storeName: string, id: IDBValidKey): Promise<T | null>;
    addData<S = T>(storeName: string, data: S[]): Promise<void>;
    deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void>;
}
