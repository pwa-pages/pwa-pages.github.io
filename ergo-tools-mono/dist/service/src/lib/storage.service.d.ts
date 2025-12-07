declare class StorageService<T> {
    db: IDBDatabase;
    constructor(db: IDBDatabase);
    getData(storeName: string): Promise<T[]>;
    getDataById(storeName: string, id: IDBValidKey | IDBKeyRange): Promise<T | null>;
    addData(storeName: string, data: T[]): Promise<void>;
}
