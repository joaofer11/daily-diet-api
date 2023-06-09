import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

import {
  it,
  expect,
  describe,
  afterAll,
  beforeAll,
  beforeEach,
} from 'vitest';

describe('Meals Routes', () => {
  beforeAll(async () => await app.ready());

  afterAll(async () => app.close());

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all');
    execSync('npm run knex -- migrate:latest');
  });

  it('should be able to list all meals', async () => {
    const createMealRes = await request(app.server)
      .post('/meals')
      .send({
        name: 'Refeição test',
        description: 'Refeição N/A de test',
        isUnderDiet: false
      });

    const cookies = createMealRes.get('Set-Cookie');

    const listMealsRes = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200);

    expect(listMealsRes.body.meals).toEqual([
      expect.objectContaining({
        name: 'Refeição test',
        description: 'Refeição N/A de test',
        is_under_diet: 0
      })
    ]);
  });

  it('should be able to create a meal', async () => {
    const createMealRes = await request(app.server)
      .post('/meals')
      .send({
        name: 'Refeição test',
        description: 'Refeição N/A de test',
        isUnderDiet: false
      })
      .expect(201);

    expect(createMealRes.body.meal).toEqual(
      expect.objectContaining({
        name: 'Refeição test',
        description: 'Refeição N/A de test',
        is_under_diet: 0
      })
    );
  });
});

