import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Connection, Container } from 'rhea-promise';
import { IActiveMQOptions } from '../interfaces/activemq-options.interface';
import { BrokerReceiver } from '../utils/receiver.util';
import { BrokerSender } from '../utils/sender.util';
import { PacketModel } from '../models/packet.model';
import { MessageModel } from '../models/message.model';

export class ActivemqClientProxy extends ClientProxy {
  // Static
  private static _container: Container;

  // Scoped
  private connection: Connection;
  private sender: BrokerSender;
  private receiver: BrokerReceiver;

  protected get container() {
    return ActivemqClientProxy._container;
  }

  protected set container(container: Container) {
    if (!ActivemqClientProxy._container)
      ActivemqClientProxy._container = container;
  }

  constructor(
    private readonly _options: IActiveMQOptions & { replyQueue: string },
  ) {
    super();
    this.container = new Container();
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

    this.sender = await BrokerSender.create(
      this.connection,
      this._options.queue,
    );

    this.receiver = await BrokerReceiver.create(
      this.connection,
      this._options.replyQueue,
    );
  }

  async close() {
    if (this.sender) await this.sender.close();
    if (this.receiver) await this.receiver.close();
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  protected publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    const payload = PacketModel.fromReadPacket(
      packet,
      this._options.replyQueue,
    );

    const subscription = this.receiver.getStream(payload.id).subscribe({
      next: (message: MessageModel) => {
        callback(message.toWritePacket());
      },
    });

    this.sender.sendPacket(payload);

    return () => {
      if (!subscription.closed) subscription.unsubscribe();
    };
  }

  protected dispatchEvent<T = any>(): Promise<T> {
    throw new Error('Method not implemented.');
  }
}
