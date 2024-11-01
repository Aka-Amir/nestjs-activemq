# Nest js ActiveMQ microservice provider

This is a microservice provider for active mq microservices in Nest.js framework, based on
rhea library.

## Features

- Request & response messaging system
- Nest.js friendly
- RxJs based
- Supports message pattern

## Installation

### npm

```bash
  npm i @nestjs/microservices @fingercoder/nestjs-activemq
```

### yarn

```bash
  yarn add @nestjs/microservices @fingercoder/nestjs-activemq
```

## Usage

### Microservice provider ( Consumer )

In main.ts file

```ts
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new ActiveMqStrategy({
      host: 'localhost',
      port: 61616,
      user: {
        username: 'Dummy user',
        password: 'Very very safe password',
      },
      queue: 'my_lovely_queue',
      path: '/',
    }),
  },
);
```

### Publisher ( Broker )

app.module.ts:

```ts
@Module({
  imports: [
    ActiveMqModule.forFeature(
      new ActiveMQConfig('my_lovely_reply_queue'), // reply queue to get response
    ),
  ],
  providers: [AppService],
})
export class AppModule {}
```

app.service.ts:

```ts
@Injectable()
export class AppService {
  constructor(@Inject(ActiveMqService) private readonly client: ClientProxy) {}
}
```

## Todo

- Add streamed data transfer
- Add more error handling and define custom errors

## Authors

- [@Aka-Amir](https://www.github.com/Aka-Amir)

## License

[MIT](https://choosealicense.com/licenses/mit/)
