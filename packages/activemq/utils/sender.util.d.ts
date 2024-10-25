import { Connection, Sender } from 'rhea-promise';
import { PacketModel } from '../models/packet.model';
export declare class BrokerSender {
    private readonly sender;
    private readonly queue;
    get connectionId(): string;
    constructor(sender: Sender, queue: string);
    close(): Promise<void>;
    kill(): Promise<void>;
    sendPacket(packet: PacketModel): void;
    private static _instances;
    static create(connection: Connection, queue: string): Promise<BrokerSender>;
}
