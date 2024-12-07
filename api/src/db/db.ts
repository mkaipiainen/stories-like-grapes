import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types/database';
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.CONNECTION_STRING,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
