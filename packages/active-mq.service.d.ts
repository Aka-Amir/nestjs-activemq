import { ActivemqClientProxy } from './activemq/client/activemq.client-proxy';
import { IActiveMQOptions } from './activemq/interfaces/activemq-options.interface';
export declare class ActiveMqService extends ActivemqClientProxy {
    constructor(config: IActiveMQOptions, appQueue: string);
}
