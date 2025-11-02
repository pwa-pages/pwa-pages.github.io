"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    timestamp;
    inputs;
    constructor(timestamp, inputs) {
        this.timestamp = timestamp;
        this.inputs = inputs;
    }
}
exports.Transaction = Transaction;
