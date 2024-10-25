"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerReceiver = void 0;
const rhea_promise_1 = require("rhea-promise");
const rxjs_1 = require("rxjs");
const message_model_1 = require("../models/message.model");
class BrokerReceiver {
    get connectionId() {
        return this.receiver.connection.id;
    }
    constructor(receiver) {
        this.receiver = receiver;
        this._stream$ = new rxjs_1.Subject();
        this._globalListener = this._stream$.subscribe({
            next: () => { },
        });
        this.listenError();
        this.listenMessage();
    }
    async close() {
        this._globalListener.unsubscribe();
        await this.receiver.close({
            closeSession: false,
        });
    }
    async kill() {
        this._globalListener.unsubscribe();
        await this.receiver.close({
            closeSession: true,
        });
    }
    listenMessage() {
        this.receiver.on(rhea_promise_1.ReceiverEvents.message, (context) => {
            this._stream$.next(message_model_1.MessageModel.fromMessage(context.message));
        });
    }
    listenError() {
        this.receiver.on(rhea_promise_1.ReceiverEvents.receiverError, (e) => console.log(e));
    }
    getStream(messageId) {
        return this._stream$
            .asObservable()
            .pipe((0, rxjs_1.filter)((data) => data.id === messageId));
    }
    static async create(connection, queue) {
        if (BrokerReceiver._instances[connection.id]) {
            return BrokerReceiver._instances[connection.id];
        }
        const receiver = await connection.createReceiver({
            source: {
                address: queue,
            },
        });
        const instance = new BrokerReceiver(receiver);
        BrokerReceiver._instances[connection.id] = instance;
        return instance;
    }
}
exports.BrokerReceiver = BrokerReceiver;
BrokerReceiver._instances = {};
//# sourceMappingURL=receiver.util.js.map