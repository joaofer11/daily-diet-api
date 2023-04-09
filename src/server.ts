import { app } from './app';

app.listen({
  port: 3333
}, (_, address) => console.log(`Server has started at ${address}`));
