import { CustomTransportStrategy, Server, Transport } from '@nestjs/microservices';
import { IActiveMQOptions } from '../interfaces/activemq-options.interface';
export declare class ActiveMqStrategy extends Server implements CustomTransportStrategy {
    private readonly _options;
    transportId?: symbol | Transport;
    private _connection;
    constructor(_options: IActiveMQOptions);
    listen(callback: () => any): Promise<void>;
    private messageReceiver;
    close(): Promise<void>;
}
