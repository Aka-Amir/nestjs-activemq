"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const procedure_failed_exception_1 = require("../errors/procedure-failed.exception");
const procedure_not_found_exception_1 = require("../errors/procedure-not-found.exception");
const unknown_exception_1 = require("../errors/unknown.exception");
class MessageModel {
    constructor(message) {
        this.id = message.id;
        this.data = message.data;
        this.hasError = message.hasError;
        this.isDisposed = message.isDisposed;
        this.status = message.status;
    }
    toWritePacket() {
        if (this.hasError) {
            let exception;
            switch (this.status) {
                case 3:
                    exception = new procedure_failed_exception_1.ProcedureFailedException(this.data, this.id);
                    break;
                case 4:
                    exception = new procedure_not_found_exception_1.ProcedureNotFoundException(this.data, this.id);
                    break;
                default:
                    exception = new unknown_exception_1.UnknownException(this.data, this.id);
            }
            return {
                isDisposed: this.isDisposed,
                err: exception,
                response: null,
                status: this.status.toString(),
            };
        }
        else {
            return {
                response: this.data,
                isDisposed: this.isDisposed,
            };
        }
    }
    static fromMessage(message) {
        return new MessageModel({
            id: message.footer.id.toString(),
            data: message.body,
            hasError: message.application_properties.code?.toString() !== '0',
            isDisposed: true,
            status: message.application_properties.code,
        });
    }
}
exports.MessageModel = MessageModel;
//# sourceMappingURL=message.model.js.map