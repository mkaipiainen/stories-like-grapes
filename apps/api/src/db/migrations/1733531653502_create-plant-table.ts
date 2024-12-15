import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('plant')
    .addColumn('id', 'varchar', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('watering_frequency', 'integer')
    .addColumn('last_watered', 'timestamp')
    .addColumn('deleted', 'boolean', (col) => col.defaultTo(false))
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('date_updated', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('plant').execute();
}
