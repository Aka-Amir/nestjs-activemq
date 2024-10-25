import { Inject, Injectable } from '@nestjs/common';
import { ActivemqClientProxy } from './activemq/client/activemq.client-proxy';
import { IActiveMQOptions } from './activemq/interfaces/activemq-options.interface';

@Injectable()
export class ActiveMqService extends ActivemqClientProxy {
  constructor(
    @Inject('ACTIVE_MQ_CONFIG') config: IActiveMQOptions,
    @Inject('APP_QUEUE') appQueue: string,
  ) {
    super({
      ...config,
      replyQueue: appQueue,
    });
  }
}
