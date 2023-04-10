import { env } from './env';
import { app } from './app';

app.listen({
  port: env.PORT
}, (_, address) => console.log(`Server has started at ${address}`));
