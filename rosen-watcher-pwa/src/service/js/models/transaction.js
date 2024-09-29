export class Transaction {
    timestamp;
    inputs;
    constructor(timestamp, inputs) {
        this.timestamp = timestamp;
        this.inputs = inputs;
    }
}
