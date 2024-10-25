import {
  CustomTransportStrategy,
  RpcException,
  Server,
  Transport,
} from '@nestjs/microservices';
import { Connection, Container } from 'rhea-promise';
import { isObservable, lastValueFrom, Observable } from 'rxjs';
import { IActiveMQOptions } from '../interfaces/activemq-options.interface';

export class ActiveMqStrategy
  extends Server
  implements CustomTransportStrategy
{
  transportId?: symbol | Transport = Transport.GRPC;
  private _connection: Connection;
  constructor(private readonly _options: IActiveMQOptions) {
    super();
  }

  async listen(callback: () => any) {
    const container = new Container();
    this._connection = await container.connect({
      host: this._options.host,
      hostname: this._options.host,
      port: this._options.port,
      username: this._options.user.username,
      password: this._options.user.password,
      path: this._options.path || '/',
    });
    await this._connection.open();
    await this.messageReceiver();
    this.logger.log('ActiveMQ started listening');
    callback();
  }

  private async messageReceiver() {
    await this._connection.createReceiver({
      name: this._options.queue,
      source: {
        address: this._options.queue,
      },
      onError: (context) => {
        console.log('error', context.receiver.error);
      },
      onMessage: async (context) => {
        const reply = await this._connection.createAwaitableSender({
          target: {
            address: context.message.reply_to,
          },
        });

        let handler = this.messageHandlers.get(context.message.subject);

        if (!handler)
          handler = this.getHandlerByPattern(context.message.subject);

        if (!handler) {
          await reply.send({
            body: {
              message: 'Not found',
            },
            subject: context.message.subject,
            footer: context.message.footer,
            application_properties: {
              code: 3,
              statusText: 'ESRCH',
            },
          });
          return;
        }

        let body: Record<string, any> = {};
        let code: number = 0;
        let statusText: string = null;

        try {
          let payload: string | Record<string, any> = {};

          if (typeof context.message.body === 'string') {
            try {
              payload = JSON.parse(context.message.body);
            } catch {
              payload = context.message.body;
            }
          } else {
            payload = context.message.body;
          }

          const streamOrResult = await handler(
            payload,
            context.message.application_properties,
          );

          if (isObservable(streamOrResult)) {
            body = await lastValueFrom(streamOrResult as Observable<any>);
          } else {
            body = streamOrResult;
          }
        } catch (e) {
          if (e instanceof RpcException) {
            if (typeof e.getError() === 'string') {
              body['message'] = e.getError();
            } else {
              body = e.getError() as Record<string, any>;
            }
          } else {
            body = {
              message: (e as Error).message,
              name: (e as Error).name,
            };
          }
          code = 4;
          statusText = 'EINTR';
        } finally {
          await reply.send({
            body,
            subject: context.message.subject,
            footer: context.message.footer,
            application_properties: {
              code,
              statusText,
            },
          });

          await reply.close();
        }
      },
    });
  }

  async close() {
    await this._connection.close();
  }
}
