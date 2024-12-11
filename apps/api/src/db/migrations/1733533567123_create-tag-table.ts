import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable('tag')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('entity_type', 'varchar')
    .addColumn('entity_id', 'uuid')
    .addColumn('name', 'varchar')
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema.createIndex('tag_entity_type_entity_id_name_index').on('tag').columns([
    'entity_id',
    'entity_type'
  ]).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
  await db.schema.dropTable('tag').execute();
}
