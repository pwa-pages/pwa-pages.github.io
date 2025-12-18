declare class MemoryStorageService<T> {
    private getMemoryStore;
    private generateKey;
    getData<S>(storeName: string): Promise<T[] | S[]>;
    getDataById(storeName: string, id: unknown): Promise<T | null>;
    addData<S = T>(storeName: string, data: S[]): Promise<void>;
    deleteData(storeName: string, keys: unknown | unknown[]): Promise<void>;
}
