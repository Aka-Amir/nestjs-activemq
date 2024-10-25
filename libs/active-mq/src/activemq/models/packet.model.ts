import { ReadPacket } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Message } from 'rhea-promise';

export class PacketModel {
  constructor(
    initialData: Omit<PacketModel, 'id' | 'toMessage'> & { id?: string },
  ) {
    Object.assign(this, initialData);
    if (!this.id) this.id = randomUUID();
  }

  pattern: string;
  body: any;
  callBack: string;
  readonly id: string;

  toMessage(): Message {
    return {
      subject: this.pattern,
      body: this.body,
      reply_to: this.callBack,
      footer: {
        id: this.id,
      },
    };
  }

  public static fromReadPacket(
    packet: ReadPacket,
    callBack: string,
  ): PacketModel {
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

    return new PacketModel({
      pattern,
      body: packet.data,
      callBack,
    });
  }
}
