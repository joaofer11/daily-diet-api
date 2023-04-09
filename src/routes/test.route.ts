import { FastifyInstance } from 'fastify';

export const testRoute = async (app: FastifyInstance) => {
  app.get('/', () => 'Hello World!');
}
