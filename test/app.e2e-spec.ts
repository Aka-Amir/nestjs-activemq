import { INestMicroservice } from '@nestjs/common';
import { ClientProxy, MicroserviceOptions } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { lastValueFrom } from 'rxjs';
import { ActivemqClientProxy } from '../src/activemq/client/activemq.client-proxy';
import { IActiveMQOptions } from '../src/activemq/interfaces/activemq-options.interface';
import { ActiveMqStrategy } from '../src/activemq/strategies/activemq.strategy';

describe('AppController (e2e)', () => {
  // let app: INestMicroservice;
  const config: IActiveMQOptions = {
    host: '127.0.0.1',
    path: '/test',
    port: 61616,
    queue: 'mock-queue-2',
    user: {
      password: 'artemis',
      username: 'artemis',
    },
  };
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: 'CLI',
          useFactory: () =>
            new ActivemqClientProxy({
              ...config,
              replyQueue: 'mock-queue-3',
            }),
        },
      ],
    }).compile();

    app = module.createNestMicroservice<MicroserviceOptions>({
      strategy: new ActiveMqStrategy({ ...config, queue: 'mock-queue-3' }),
    });

    await app.init();
    client = app.get<ClientProxy>('CLI');
    await app.listen();
    await client.connect();
  });

  afterAll(async () => {
    await app.close();
  });

  it(
    '/ (GET)',
    async () => {
      await lastValueFrom(
        client.send({ cmd: 'a' }, { message: 'hello world' }),
      );
    },
    60 * 1000,
  );
});
