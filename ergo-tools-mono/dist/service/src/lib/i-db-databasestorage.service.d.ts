import { IStorageService } from "./constants";
export declare class IDBDatabaseStorageService<T> implements IStorageService<T> {
    db: IDBDatabase;
    constructor(db: IDBDatabase);
    getData<S>(storeName: string, key?: IDBValidKey): Promise<T[] | S[]>;
    getDataById(storeName: string, id: IDBValidKey): Promise<T | null>;
    addData<S = T>(storeName: string, data: S[], key?: IDBValidKey): Promise<void>;
    deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void>;
}
