import { DynamicModule } from '@nestjs/common';
import { ActiveMqService } from './active-mq.service';
import { IActiveMQOptions } from './activemq/interfaces/activemq-options.interface';

export class ActiveMqModule {
  static forRoot = (replyQueueAddress: string): DynamicModule => {
    return {
      module: ActiveMqModule,
      global: true,
      providers: [
        {
          provide: 'APP_QUEUE',
          useValue: replyQueueAddress,
        },
      ],
      exports: ['APP_QUEUE'],
    };
  };

  static forFeature = (options: IActiveMQOptions): DynamicModule => {
    return {
      module: ActiveMqModule,
      providers: [
        {
          provide: 'ACTIVE_MQ_CONFIG',
          useValue: options,
        },
        ActiveMqService,
      ],
      exports: [ActiveMqService],
    };
  };
}
