import { z } from 'zod';
import { knex } from '../db';
import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { sendMissingFieldsMessage } from '../helpers/send-missing-fields-message';

export const usersRoutes = async (app: FastifyInstance) => {
  app.post('/', async (req, res) => {
    let { sessionId } = req.cookies;

    if (sessionId) {
      res.status(403).send({ error: 'Cannot create a new user because you are already authenticated'})
      return;
    }

    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const parsedReq = createUserBodySchema.safeParse(req.body);

    if (!parsedReq.success) {
      const missingFieldsArr = Object.keys(parsedReq
                                           .error
                                           .formErrors
                                           .fieldErrors
                                          );

      sendMissingFieldsMessage(missingFieldsArr, res);
      return;
    }

    sessionId = randomUUID();

    const [user] = await knex('users')
      .insert({
        id: randomUUID(),
        session_id: sessionId,
        name: parsedReq.data.name
      })
      .returning('*');

    res
      .status(201)
      .cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
      .send({ user });
  });
}
