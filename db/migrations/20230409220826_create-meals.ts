import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary();
    table.uuid('session_id').notNullable().index().references('session_id').inTable('users');
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.boolean('is_under_diet').defaultTo(true).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}

