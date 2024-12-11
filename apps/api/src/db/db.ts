import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types/database.js';
const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.CONNECTION_STRING,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
