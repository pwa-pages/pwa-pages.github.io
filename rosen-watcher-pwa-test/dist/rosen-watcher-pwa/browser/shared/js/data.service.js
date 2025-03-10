// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DataService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getData(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
}
