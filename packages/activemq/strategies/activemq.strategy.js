"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveMqStrategy = void 0;
const microservices_1 = require("@nestjs/microservices");
const rhea_promise_1 = require("rhea-promise");
const rxjs_1 = require("rxjs");
class ActiveMqStrategy extends microservices_1.Server {
    constructor(_options) {
        super();
        this._options = _options;
        this.transportId = microservices_1.Transport.GRPC;
    }
    async listen(callback) {
        const container = new rhea_promise_1.Container();
        this._connection = await container.connect({
            host: this._options.host,
            hostname: this._options.host,
            port: this._options.port,
            username: this._options.user.username,
            password: this._options.user.password,
            path: this._options.path || '/',
        });
        await this._connection.open();
        await this.messageReceiver();
        this.logger.log('ActiveMQ started listening');
        callback();
    }
    async messageReceiver() {
        await this._connection.createReceiver({
            name: this._options.queue,
            source: {
                address: this._options.queue,
            },
            onError: (context) => {
                console.log('error', context.receiver.error);
            },
            onMessage: async (context) => {
                const reply = await this._connection.createAwaitableSender({
                    target: {
                        address: context.message.reply_to,
                    },
                });
                let handler = this.messageHandlers.get(context.message.subject);
                if (!handler)
                    handler = this.getHandlerByPattern(context.message.subject);
                if (!handler) {
                    await reply.send({
                        body: {
                            message: 'Not found',
                        },
                        subject: context.message.subject,
                        footer: context.message.footer,
                        application_properties: {
                            code: 3,
                            statusText: 'ESRCH',
                        },
                    });
                    return;
                }
                let body = {};
                let code = 0;
                let statusText = null;
                try {
                    let payload = {};
                    if (typeof context.message.body === 'string') {
                        try {
                            payload = JSON.parse(context.message.body);
                        }
                        catch {
                            payload = context.message.body;
                        }
                    }
                    else {
                        payload = context.message.body;
                    }
                    const streamOrResult = await handler(payload, context.message.application_properties);
                    if ((0, rxjs_1.isObservable)(streamOrResult)) {
                        body = await (0, rxjs_1.lastValueFrom)(streamOrResult);
                    }
                    else {
                        body = streamOrResult;
                    }
                }
                catch (e) {
                    if (e instanceof microservices_1.RpcException) {
                        if (typeof e.getError() === 'string') {
                            body['message'] = e.getError();
                        }
                        else {
                            body = e.getError();
                        }
                    }
                    else {
                        body = {
                            message: e.message,
                            name: e.name,
                        };
                    }
                    code = 4;
                    statusText = 'EINTR';
                }
                finally {
                    await reply.send({
                        body,
                        subject: context.message.subject,
                        footer: context.message.footer,
                        application_properties: {
                            code,
                            statusText,
                        },
                    });
                    await reply.close();
                }
            },
        });
    }
    async close() {
        await this._connection.close();
    }
}
exports.ActiveMqStrategy = ActiveMqStrategy;
//# sourceMappingURL=activemq.strategy.js.map