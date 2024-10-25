import {
  Connection,
  EventContext,
  Receiver,
  ReceiverEvents,
} from 'rhea-promise';
import { filter, Subject, Subscription } from 'rxjs';
import { MessageModel } from '../models/message.model';

export class BrokerReceiver {
  public get connectionId() {
    return this.receiver.connection.id;
  }

  private readonly _stream$: Subject<MessageModel>;
  private readonly _globalListener: Subscription;

  constructor(private readonly receiver: Receiver) {
    this._stream$ = new Subject<MessageModel>();
    this._globalListener = this._stream$.subscribe({
      next: () => {},
    });
    this.listenError();
    this.listenMessage();
  }

  async close() {
    this._globalListener.unsubscribe();
    await this.receiver.close({
      closeSession: false,
    });
  }

  async kill() {
    this._globalListener.unsubscribe();
    await this.receiver.close({
      closeSession: true,
    });
  }

  private listenMessage() {
    this.receiver.on(ReceiverEvents.message, (context: EventContext) => {
      this._stream$.next(MessageModel.fromMessage(context.message));
    });
  }

  private listenError() {
    this.receiver.on(ReceiverEvents.receiverError, (e) => console.log(e));
  }

  public getStream(messageId: string) {
    return this._stream$
      .asObservable()
      .pipe(filter((data) => data.id === messageId));
  }

  private static _instances: Record<string, BrokerReceiver> = {};
  public static async create(connection: Connection, queue: string) {
    if (BrokerReceiver._instances[connection.id]) {
      return BrokerReceiver._instances[connection.id];
    }

    const receiver = await connection.createReceiver({
      source: {
        address: queue,
      },
    });

    const instance = new BrokerReceiver(receiver);
    BrokerReceiver._instances[connection.id] = instance;

    return instance;
  }
}
