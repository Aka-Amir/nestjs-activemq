import { DynamicModule } from '@nestjs/common';
import { IActiveMQOptions } from './activemq/interfaces/activemq-options.interface';
export declare class ActiveMqModule {
    static forRoot: (replyQueueAddress: string) => DynamicModule;
    static forFeature: (options: IActiveMQOptions) => DynamicModule;
}
