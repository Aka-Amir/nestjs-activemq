import { WritePacket } from '@nestjs/microservices';
import { Message } from 'rhea-promise';
import { BasicAmqException } from '../errors/basic-amq-error.exception';
import { ProcedureFailedException } from '../errors/procedure-failed.exception';
import { ProcedureNotFoundException } from '../errors/procedure-not-found.exception';
import { UnknownException } from '../errors/unknown.exception';

export class MessageModel<T = any> {
  constructor(message: Omit<MessageModel<T>, 'toWritePacket'>) {
    this.id = message.id;
    this.data = message.data;
    this.hasError = message.hasError;
    this.isDisposed = message.isDisposed;
    this.status = message.status;
  }

  readonly id: string;
  readonly data: T;
  readonly isDisposed: boolean;
  readonly status: number;
  readonly hasError: boolean;

  public toWritePacket(): WritePacket {
    if (this.hasError) {
      let exception: BasicAmqException;

      switch (this.status) {
        case 3:
          exception = new ProcedureFailedException(
            this.data as object,
            this.id,
          );
          break;
        case 4:
          exception = new ProcedureNotFoundException(
            this.data as object,
            this.id,
          );
          break;
        default:
          exception = new UnknownException(this.data as object, this.id);
          break;
      }

      return {
        isDisposed: this.isDisposed,
        err: exception,
        response: null,
        status: this.status.toString(),
      };
    } else {
      return {
        response: this.data,
        isDisposed: this.isDisposed,
      };
    }
  }

  public static fromMessage(message: Message): MessageModel {
    return new MessageModel({
      id: message.footer.id.toString(),
      data: message.body,
      hasError: message.application_properties.code?.toString() !== '0',
      isDisposed: true,
      status: message.application_properties.code,
    });
  }
}
