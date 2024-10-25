import { RpcException } from '@nestjs/microservices';

export abstract class BasicAmqException extends RpcException {
  constructor(
    error: string | object,
    public readonly messageId: string,
  ) {
    super(error);
  }
}
