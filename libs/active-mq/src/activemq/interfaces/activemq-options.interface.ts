export interface IActiveMQOptions {
  host: string;
  port: number;
  path: string;
  heartBeat?: string;
  queue: string;
  user: {
    username: string;
    password: string;
  };
}
