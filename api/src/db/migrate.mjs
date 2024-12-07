import * as path from 'path'
import pg from 'pg'
import { promises as fs } from 'fs'
import {
  Kysely,
  Migrator,
  PostgresDialect,
} from 'kysely'
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import { TSFileMigrationProvider } from 'kysely-ctl';

async function migrateToLatest() {
  console.log("Starting migrations...");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: process.env.CONNECTION_STRING || 'postgresql://postgres@localhost:5433/storieslikegrapes?schema=public',
      })
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new TSFileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()
  console.log("Migration results:", results.length);
  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    } else {
      console.error(`migration "${it.migrationName}" has undetermined status`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }
  console.log("Succesfully ran all migrations");
  await db.destroy()
  process.exit(0)
}

migrateToLatest()