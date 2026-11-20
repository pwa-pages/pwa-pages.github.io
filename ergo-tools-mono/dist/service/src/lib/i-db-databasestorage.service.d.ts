import { IStorageService } from "./constants";
export declare class IDBDatabaseStorageService implements IStorageService {
    private db;
    constructor();
    initIndexedDB(): Promise<IDBDatabase>;
    getData<S>(storeName: string, key?: IDBValidKey): Promise<S[]>;
    getDataById<S>(storeName: string, id: IDBValidKey): Promise<S | null>;
    addData<S>(storeName: string, data: S[], key?: IDBValidKey): Promise<void>;
    deleteData(storeName: string, keys: IDBValidKey | IDBValidKey[]): Promise<void>;
}
