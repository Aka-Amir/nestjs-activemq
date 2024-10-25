import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import {
  AwaitableSender,
  Connection,
  Container,
  EventContext,
  Message,
  Receiver,
} from 'rhea-promise';
import { filter, Observable, Subject, Subscription } from 'rxjs';
import { IActiveMQOptions } from '../interfaces/activemq-options.interface';

export class ActivemqClientProxy extends ClientProxy {
  private readonly container: Container;
  private connection: Connection;

  private sender: AwaitableSender;
  private receiver: Receiver;
  private responseEvent$ = new Subject<{
    id: string;
    data: any;
    isDisposed: boolean;
    status: number;
    hasError: boolean;
  }>();
  private readonly _globalSubscription: Subscription;

  constructor(
    private readonly _options: IActiveMQOptions & { replyQueue: string },
  ) {
    super();
    this.container = new Container();
    this._globalSubscription = this.responseEvent$.subscribe();
  }

  async connect(): Promise<any> {
    if (!this.connection) {
      this.connection = await this.container.connect({
        host: this._options.host,
        hostname: this._options.host,
        port: this._options.port,
        username: this._options.user.username,
        password: this._options.user.password,
        path: this._options.path || '/',
      });
    }

    if (!this.sender) {
      this.sender = await this.connection.createAwaitableSender({
        target: {
          address: this._options.queue,
        },
        onError: () => {
          console.log('Error');
        },
        onSessionError: () => {
          console.log('session error');
        },
      });
    }

    if (!this.receiver) {
      this.receiver = await this.connection.createReceiver({
        source: {
          address: this._options.replyQueue,
        },
        onError: () => {},
        onMessage: (context) => this.onNewMessage(context),
      });
    }
  }

  protected onNewMessage(ctx: EventContext) {
    this.responseEvent$.next({
      id: ctx.message.footer.id.toString(),
      data: ctx.message.body,
      hasError: ctx.message.application_properties.code?.toString() === '0',
      isDisposed: true,
      status: ctx.message.application_properties.code,
    });
  }

  async close() {
    if (this.sender) await this.sender.close();
    if (this.receiver) await this.receiver.close();
    if (this.connection) await this.connection.close();
    if (this._globalSubscription) {
      this._globalSubscription.unsubscribe();
      this.responseEvent$.complete();
    }
  }

  protected packetFactory(packet: ReadPacket): Message {
    let pattern: string = '';

    switch (typeof packet.pattern) {
      case 'string':
        pattern = packet.pattern;
        break;
      case 'object':
        pattern = JSON.stringify(packet.pattern);
        break;
      case 'undefined':
      case 'function':
        throw new Error('Unable to parse');
      default:
        pattern = packet.pattern.toString();
        break;
    }

    return {
      subject: pattern,
      body: packet.data,
      reply_to: this._options.replyQueue,
      footer: {
        id: randomUUID(),
      },
    };
  }

  private onSend(packet: ReadPacket): Observable<WritePacket> {
    return new Observable((subscriber) => {
      const data = this.packetFactory(packet);

      const subscription = this.responseEvent$
        .asObservable()
        .pipe(
          filter(({ id }) => {
            console.log(id);
            return id === data.footer.id.toString();
          }),
        )
        .subscribe({
          next: (response) => {
            console.log(response);

            if (response.hasError) {
              subscriber.next({
                response: response.data,
                isDisposed: response.isDisposed,
                err: response.hasError,
                status: response.status.toString(),
              });
            } else {
              subscriber.next({
                response: response.data,
                isDisposed: response.isDisposed,
              });
            }

            if (response.isDisposed) {
              subscriber.complete();
              if (!subscription.closed) subscription.unsubscribe();
            }
          },
        });

      this.sender.send(data).catch((e) => {
        console.error(e);
        return undefined;
      });
    });
  }

  protected publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    const subscription = this.onSend(packet).subscribe({
      next: (data) => callback(data),
    });

    return () => {
      if (!subscription?.closed) subscription.unsubscribe();
    };
  }

  protected dispatchEvent<T = any>(): Promise<T> {
    throw new Error('Method not implemented.');
  }
}
