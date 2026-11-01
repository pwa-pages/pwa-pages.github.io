"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    timestamp;
    inputs;
    id;
    outputs;
    constructor(timestamp, inputs, id, outputs) {
        this.timestamp = timestamp;
        this.inputs = inputs;
        this.id = id;
        this.outputs = outputs;
    }
}
exports.Transaction = Transaction;
