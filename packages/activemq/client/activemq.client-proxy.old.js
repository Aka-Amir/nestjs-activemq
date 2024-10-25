"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivemqClientProxy = void 0;
const microservices_1 = require("@nestjs/microservices");
const crypto_1 = require("crypto");
const rhea_promise_1 = require("rhea-promise");
const rxjs_1 = require("rxjs");
class ActivemqClientProxy extends microservices_1.ClientProxy {
    constructor(_options) {
        super();
        this._options = _options;
        this.responseEvent$ = new rxjs_1.Subject();
        this.container = new rhea_promise_1.Container();
        this._globalSubscription = this.responseEvent$.subscribe();
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
        if (!this.sender) {
            this.sender = await this.connection.createAwaitableSender({
                target: {
                    address: this._options.queue,
                },
                onError: () => {
                    console.log('Error');
                },
                onSessionError: () => {
                    console.log('session error');
                },
            });
        }
        if (!this.receiver) {
            this.receiver = await this.connection.createReceiver({
                source: {
                    address: this._options.replyQueue,
                },
                onError: () => { },
                onMessage: (context) => this.onNewMessage(context),
            });
        }
    }
    onNewMessage(ctx) {
        this.responseEvent$.next({
            id: ctx.message.footer.id.toString(),
            data: ctx.message.body,
            hasError: ctx.message.application_properties.code?.toString() === '0',
            isDisposed: true,
            status: ctx.message.application_properties.code,
        });
    }
    async close() {
        if (this.sender)
            await this.sender.close();
        if (this.receiver)
            await this.receiver.close();
        if (this.connection)
            await this.connection.close();
        if (this._globalSubscription) {
            this._globalSubscription.unsubscribe();
            this.responseEvent$.complete();
        }
    }
    packetFactory(packet) {
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
        return {
            subject: pattern,
            body: packet.data,
            reply_to: this._options.replyQueue,
            footer: {
                id: (0, crypto_1.randomUUID)(),
            },
        };
    }
    onSend(packet) {
        return new rxjs_1.Observable((subscriber) => {
            const data = this.packetFactory(packet);
            const subscription = this.responseEvent$
                .asObservable()
                .pipe((0, rxjs_1.filter)(({ id }) => {
                console.log(id);
                return id === data.footer.id.toString();
            }))
                .subscribe({
                next: (response) => {
                    console.log(response);
                    if (response.hasError) {
                        subscriber.next({
                            response: response.data,
                            isDisposed: response.isDisposed,
                            err: response.hasError,
                            status: response.status.toString(),
                        });
                    }
                    else {
                        subscriber.next({
                            response: response.data,
                            isDisposed: response.isDisposed,
                        });
                    }
                    if (response.isDisposed) {
                        subscriber.complete();
                        if (!subscription.closed)
                            subscription.unsubscribe();
                    }
                },
            });
            this.sender.send(data).catch((e) => {
                console.error(e);
                return undefined;
            });
        });
    }
    publish(packet, callback) {
        const subscription = this.onSend(packet).subscribe({
            next: (data) => callback(data),
        });
        return () => {
            if (!subscription?.closed)
                subscription.unsubscribe();
        };
    }
    dispatchEvent() {
        throw new Error('Method not implemented.');
    }
}
exports.ActivemqClientProxy = ActivemqClientProxy;
//# sourceMappingURL=activemq.client-proxy.old.js.map