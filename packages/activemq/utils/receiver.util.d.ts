import { Connection, Receiver } from 'rhea-promise';
import { MessageModel } from '../models/message.model';
export declare class BrokerReceiver {
    private readonly receiver;
    get connectionId(): string;
    private readonly _stream$;
    private readonly _globalListener;
    constructor(receiver: Receiver);
    close(): Promise<void>;
    kill(): Promise<void>;
    private listenMessage;
    private listenError;
    getStream(messageId: string): import("rxjs").Observable<MessageModel<any>>;
    private static _instances;
    static create(connection: Connection, queue: string): Promise<BrokerReceiver>;
}
