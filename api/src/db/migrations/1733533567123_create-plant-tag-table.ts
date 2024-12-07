import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
  db.schema.createTable('plant_tag')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('plant_id', 'uuid', (col) => col.references('plant.id').notNull())
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
  db.schema.dropTable('plant_tag').execute();
}
