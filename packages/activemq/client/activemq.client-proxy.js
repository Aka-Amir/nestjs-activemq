"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivemqClientProxy = void 0;
const microservices_1 = require("@nestjs/microservices");
const rhea_promise_1 = require("rhea-promise");
const receiver_util_1 = require("../utils/receiver.util");
const sender_util_1 = require("../utils/sender.util");
const packet_model_1 = require("../models/packet.model");
class ActivemqClientProxy extends microservices_1.ClientProxy {
    get container() {
        return ActivemqClientProxy._container;
    }
    set container(container) {
        if (!ActivemqClientProxy._container)
            ActivemqClientProxy._container = container;
    }
    constructor(_options) {
        super();
        this._options = _options;
        this.container = new rhea_promise_1.Container();
    }
    async connect() {
        if (!this.connection) {
            this.connection = await this.container.connect({
                host: this._options.host,
                hostname: this._options.host,
                port: this._options.port,
                username: this._options.user.username,
                password: this._options.user.password,
                path: this._options.path || '/',
            });
        }
        this.sender = await sender_util_1.BrokerSender.create(this.connection, this._options.queue);
        this.receiver = await receiver_util_1.BrokerReceiver.create(this.connection, this._options.replyQueue);
    }
    async close() {
        if (this.sender)
            await this.sender.close();
        if (this.receiver)
            await this.receiver.close();
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
    publish(packet, callback) {
        const payload = packet_model_1.PacketModel.fromReadPacket(packet, this._options.replyQueue);
        const subscription = this.receiver.getStream(payload.id).subscribe({
            next: (message) => {
                callback(message.toWritePacket());
            },
        });
        this.sender.sendPacket(payload);
        return () => {
            if (!subscription.closed)
                subscription.unsubscribe();
        };
    }
    dispatchEvent() {
        throw new Error('Method not implemented.');
    }
}
exports.ActivemqClientProxy = ActivemqClientProxy;
//# sourceMappingURL=activemq.client-proxy.js.map