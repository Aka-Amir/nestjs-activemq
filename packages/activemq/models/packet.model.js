"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketModel = void 0;
const crypto_1 = require("crypto");
class PacketModel {
    constructor(initialData) {
        Object.assign(this, initialData);
        if (!this.id)
            this.id = (0, crypto_1.randomUUID)();
    }
    toMessage() {
        return {
            subject: this.pattern,
            body: this.body,
            reply_to: this.callBack,
            footer: {
                id: this.id,
            },
        };
    }
    static fromReadPacket(packet, callBack) {
        let pattern = '';
        switch (typeof packet.pattern) {
            case 'string':
                pattern = packet.pattern;
                break;
            case 'object':
                pattern = JSON.stringify(packet.pattern);
                break;
            case 'undefined':
            case 'function':
                throw new Error('Unable to parse');
            default:
                pattern = packet.pattern.toString();
                break;
        }
        return new PacketModel({
            pattern,
            body: packet.data,
            callBack,
        });
    }
}
exports.PacketModel = PacketModel;
//# sourceMappingURL=packet.model.js.map