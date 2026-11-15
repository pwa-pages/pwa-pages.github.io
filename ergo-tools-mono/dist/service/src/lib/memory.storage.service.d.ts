import { IStorageService } from "./constants";
export declare class MemoryStorageService<T> implements IStorageService {
    private getMemoryStore;
    private generateKey;
    getData<S>(storeName: string): Promise<S[]>;
    getDataById<S>(storeName: string, id: unknown): Promise<S | null>;
    addData<S>(storeName: string, data: S[], key?: IDBValidKey): Promise<void>;
    deleteData(storeName: string, keys: unknown | unknown[]): Promise<void>;
}
