import { z } from 'zod';
import { knex } from '../db';
import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';
import { sendMissingFieldsMessage } from '../helpers/send-missing-fields-message';

export const mealsRoutes = async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists]
    },
    async (req) => {
      const { sessionId } = req.cookies;

      const meals = await knex('meals')
        .where('session_id', sessionId)
        .select('*');

      return { meals }
    }
  );

  app.get('/:id', async (req, res) => {
    const pathParamsSchema = z.object({
      id: z.string().uuid()
    });

    const parsedReq = pathParamsSchema.safeParse(req.params);

    if (!parsedReq.success) {
      res.status(400).send({ error: 'Invalid ID' });
      return;
    }

    const meal = await knex('meals')
      .where('id', parsedReq.data.id)
      .first();

    return { meal }
  });

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists]
    },
    async (req, res) => {
      const { sessionId } = req.cookies;

      const meals = await knex('meals')
        .where('session_id', sessionId)
        .select('is_under_diet');

      
      const metrics = meals.reduce((acc, meal) => {
        acc.mealsInsideOfDiet += meal.is_under_diet;
        acc.mealsOutsideOfDiet -= meal.is_under_diet - 1;
        acc.bestSequenceOfMealsInsideOfDiet = +(acc.mealsInsideOfDiet / acc.maxMealsAmount * 100).toFixed(2);

        return acc;
      }, {
        maxMealsAmount: meals.length,
        mealsInsideOfDiet: 0,
        mealsOutsideOfDiet: 0,
        bestSequenceOfMealsInsideOfDiet: 0,
      });
      
      return { metrics };
    });

  app.post('/', async (req, res) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isUnderDiet: z.boolean()
    });

    const parsedReq = createMealBodySchema.safeParse(req.body);

    if (!parsedReq.success) {
      const missingFieldsArr = Object.keys(parsedReq
                                           .error
                                           .formErrors
                                           .fieldErrors
                                          );

      sendMissingFieldsMessage(missingFieldsArr, res); 
      return;
    }

    const sessionId = req.cookies.sessionId ?? randomUUID();
    
    const [meal] = await knex('meals')
      .insert({
        id: randomUUID(),
        session_id: sessionId,
        name: parsedReq.data.name,
        description: parsedReq.data.description,
        is_under_diet: parsedReq.data.isUnderDiet
      })
      .returning('*');

    res
      .status(201)
      .cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
      .send({ meal });
  });

  app.put('/:id', async (req, res) => {
    const pathParamsSchema = z.object({
      id: z.string().uuid()
    });

    const parsedPathParams = pathParamsSchema.safeParse(req.params);

    if (!parsedPathParams.success) {
      res.status(400).send({ error: 'Invalid ID' });
      return;
    }

    const mealUpdateBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isUnderDiet: z.boolean()
    });

    const parsedBody = mealUpdateBodySchema.parse(req.body);

    const [meal] = await knex('meals')
      .where('id', parsedPathParams.data.id)
      .update({
        name: parsedBody.name,
        description: parsedBody.description,
        is_under_diet: parsedBody.isUnderDiet
      })
      .returning('*');

    res.status(200).send({ meal });
  });

  app.delete('/:id', async (req, res) => {
    const pathParamsSchema = z.object({
      id: z.string().uuid()
    });

    const parsedReq = pathParamsSchema.safeParse(req.params);

    if (!parsedReq.success) {
      res.status(400).send({ error: 'Invalid ID' });
      return;
    }

    await knex('meals')
      .where('id', parsedReq.data.id)
      .del();

    res.status(202).send();
  });
}
