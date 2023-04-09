import { knex as setupKnex, Knex } from 'knex';

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './db/app.ts'
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}

export const knex = setupKnex(config);

