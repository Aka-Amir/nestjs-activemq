"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerSender = void 0;
class BrokerSender {
    get connectionId() {
        return this.sender.connection.id;
    }
    constructor(sender, queue) {
        this.sender = sender;
        this.queue = queue;
    }
    async close() {
        await this.sender.close({
            closeSession: false,
        });
    }
    async kill() {
        await this.sender.close({
            closeSession: true,
        });
    }
    sendPacket(packet) {
        this.sender.send({
            ...packet.toMessage(),
            to: this.queue,
        });
    }
    static async create(connection, queue) {
        if (BrokerSender._instances[connection.id]) {
            return BrokerSender._instances[connection.id];
        }
        const sender = await connection.createSender({
            target: {
                address: queue,
            },
        });
        const instance = new BrokerSender(sender, queue);
        BrokerSender._instances[connection.id] = instance;
        return instance;
    }
}
exports.BrokerSender = BrokerSender;
BrokerSender._instances = {};
//# sourceMappingURL=sender.util.js.map