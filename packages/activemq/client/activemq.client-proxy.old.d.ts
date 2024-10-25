import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { EventContext, Message } from 'rhea-promise';
import { IActiveMQOptions } from '../interfaces/activemq-options.interface';
export declare class ActivemqClientProxy extends ClientProxy {
    private readonly _options;
    private readonly container;
    private connection;
    private sender;
    private receiver;
    private responseEvent$;
    private readonly _globalSubscription;
    constructor(_options: IActiveMQOptions & {
        replyQueue: string;
    });
    connect(): Promise<any>;
    protected onNewMessage(ctx: EventContext): void;
    close(): Promise<void>;
    protected packetFactory(packet: ReadPacket): Message;
    private onSend;
    protected publish(packet: ReadPacket, callback: (packet: WritePacket) => void): () => void;
    protected dispatchEvent<T = any>(): Promise<T>;
}
