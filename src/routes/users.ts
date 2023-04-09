import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';

export const usersRoutes = async (app: FastifyInstance) => {
  app.post('/', async (req, res) => {

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

      res.status(400).send({ error: `Is missing the fallowing fields: ${missingFieldsArr}`});
      
      return;
    }
    
    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });
    }

    const user = {
      id: randomUUID(),
      sessionId,
      ...parsedReq.data
    }

    res.status(201).send({ user });
  });
}
