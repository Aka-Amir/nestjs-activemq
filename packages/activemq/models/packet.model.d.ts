import { ReadPacket } from '@nestjs/microservices';
import { Message } from 'rhea-promise';
export declare class PacketModel {
    constructor(initialData: Omit<PacketModel, 'id' | 'toMessage'> & {
        id?: string;
    });
    pattern: string;
    body: any;
    callBack: string;
    readonly id: string;
    toMessage(): Message;
    static fromReadPacket(packet: ReadPacket, callBack: string): PacketModel;
}
