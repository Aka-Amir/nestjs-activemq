import { RpcException } from '@nestjs/microservices';
export declare abstract class BasicAmqException extends RpcException {
    readonly messageId: string;
    constructor(error: string | object, messageId: string);
}
