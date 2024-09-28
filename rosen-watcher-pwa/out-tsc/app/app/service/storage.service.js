import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let StorageService = class StorageService {
    constructor() {
        this.dbName = 'rosenDatabase_1.1.5';
        this.inputsStoreName = 'inputBoxes';
        this.downloadStatusStoreName = 'downloadStatusStore';
        this.addressDataStoreName = 'addressData';
        this.inputsCache = [];
        this.dbPromise = this.initIndexedDB();
    }
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.dbName, 18);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (db.objectStoreNames.contains(this.inputsStoreName)) {
                    db.deleteObjectStore(this.inputsStoreName);
                }
                db.createObjectStore(this.inputsStoreName, { keyPath: ['boxId', 'outputAddress'] });
                if (!db.objectStoreNames.contains(this.addressDataStoreName)) {
                    db.createObjectStore(this.addressDataStoreName, {
                        keyPath: 'address',
                    });
                }
                if (!db.objectStoreNames.contains(this.downloadStatusStoreName)) {
                    db.createObjectStore(this.downloadStatusStoreName, {
                        keyPath: 'address',
                    });
                }
            };
            request.onsuccess = async (event) => {
                const db = event.target.result;
                resolve(db);
            };
            request.onerror = (event) => {
                console.error('Error opening IndexedDB:', event.target);
                reject(event.target);
            };
        });
    }
    async getDB() {
        return await this.dbPromise;
    }
    async clearAddressStore() {
        const db = await this.getDB();
        return new Promise((resolve) => {
            const transaction = db.transaction([this.addressDataStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.addressDataStoreName);
            const request = objectStore.clear();
            request.onsuccess = () => {
                console.log('IndexedDB cleared successfully.');
                resolve();
            };
            request.onerror = (event) => {
                console.error('Error clearing IndexedDB:', event.target);
                resolve();
            };
        });
    }
    async clearInputsStore() {
        const db = await this.getDB();
        return new Promise((resolve) => {
            const transaction = db.transaction([this.inputsStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.inputsStoreName);
            const request = objectStore.clear();
            request.onsuccess = () => {
                console.log('IndexedDB cleared successfully.');
                resolve();
            };
            request.onerror = (event) => {
                console.error('Error clearing IndexedDB:', event.target);
                resolve();
            };
        });
    }
    async getInputs() {
        console.log('Getting inputs from database');
        this.inputsCache = await this.getData(this.inputsStoreName);
        return this.inputsCache;
    }
    async getAddressData() {
        return await this.getData(this.addressDataStoreName);
    }
    async getData(storeName) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(event.target);
            };
        });
    }
    async putAddressData(addressData) {
        await this.clearAddressStore();
        const db = await this.getDB();
        addressData.forEach((a) => {
            const transaction = db.transaction([this.addressDataStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.addressDataStoreName);
            objectStore.put(a);
        });
    }
};
StorageService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], StorageService);
export { StorageService };
//# sourceMappingURL=storage.service.js.map