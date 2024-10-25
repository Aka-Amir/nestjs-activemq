"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicAmqException = void 0;
const microservices_1 = require("@nestjs/microservices");
class BasicAmqException extends microservices_1.RpcException {
    constructor(error, messageId) {
        super(error);
        this.messageId = messageId;
    }
}
exports.BasicAmqException = BasicAmqException;
//# sourceMappingURL=basic-amq-error.exception.js.map