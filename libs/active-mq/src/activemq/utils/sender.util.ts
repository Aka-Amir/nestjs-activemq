import { Connection, Sender } from 'rhea-promise';
import { PacketModel } from '../models/packet.model';

export class BrokerSender {
  public get connectionId() {
    return this.sender.connection.id;
  }

  constructor(
    private readonly sender: Sender,
    private readonly queue: string,
  ) {}

  async close() {
    await this.sender.close({
      closeSession: false,
    });
  }

  async kill() {
    await this.sender.close({
      closeSession: true,
    });
  }

  sendPacket(packet: PacketModel) {
    this.sender.send({
      ...packet.toMessage(),
      to: this.queue,
    });
  }

  private static _instances: Record<string, BrokerSender> = {};
  public static async create(connection: Connection, queue: string) {
    if (BrokerSender._instances[connection.id]) {
      return BrokerSender._instances[connection.id];
    }

    const sender = await connection.createSender({
      target: {
        address: queue,
      },
    });

    const instance = new BrokerSender(sender, queue);
    BrokerSender._instances[connection.id] = instance;

    return instance;
  }
}
