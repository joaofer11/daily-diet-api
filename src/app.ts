import fastify from 'fastify';
import { testRoute } from './routes/test.route';

export const app = fastify();

app.register(testRoute);
