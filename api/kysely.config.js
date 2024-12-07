import { defineConfig } from "kysely-ctl";
import { db } from './src/db/db';

export default defineConfig({
  kysely: db, // a `Kysely` dialect instance OR the name of an underlying driver library (e.g. `'pg'`).
  migrations: { // optional.
    migrationFolder: 'src/db/migrations', // optional. name of migrations folder. default is `'migrations'`.
  },
  seeds: {
    seedFolder: 'src/db/seeds',
  }
});