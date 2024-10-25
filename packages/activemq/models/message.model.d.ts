import { WritePacket } from '@nestjs/microservices';
import { Message } from 'rhea-promise';
export declare class MessageModel<T = any> {
    constructor(message: Omit<MessageModel<T>, 'toWritePacket'>);
    readonly id: string;
    readonly data: T;
    readonly isDisposed: boolean;
    readonly status: number;
    readonly hasError: boolean;
    toWritePacket(): WritePacket;
    static fromMessage(message: Message): MessageModel;
}
