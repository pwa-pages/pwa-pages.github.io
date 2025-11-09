"use strict";
class DataService {
  constructor(db) {
    this.db = db;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async purgeData(_db) {
  }
  getMaxDownloadDateDifference() {
    return 315576e7;
  }
  async getData(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [storeName],
        "readonly"
      );
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  async getDataWithCursor(storeName, filterFn) {
    return new Promise((resolve, reject) => {
      const results = [];
      const transaction = this.db.transaction([storeName], "readonly");
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const value = cursor.value;
          if (!filterFn || filterFn(value)) {
            results.push(value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }
}
