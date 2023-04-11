import { z } from 'zod';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables!', parsedEnv.error.format());

  throw new Error();
}

export const env = parsedEnv.data;
