import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Container } from 'rhea-promise';
import { IActiveMQOptions } from '../interfaces/activemq-options.interface';
export declare class ActivemqClientProxy extends ClientProxy {
    private readonly _options;
    private static _container;
    private connection;
    private sender;
    private receiver;
    protected get container(): Container;
    protected set container(container: Container);
    constructor(_options: IActiveMQOptions & {
        replyQueue: string;
    });
    connect(): Promise<any>;
    close(): Promise<void>;
    protected publish(packet: ReadPacket, callback: (packet: WritePacket) => void): () => void;
    protected dispatchEvent<T = any>(): Promise<T>;
}
