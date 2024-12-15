import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('notification')
		.addColumn('id', 'varchar', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('user_id', 'varchar', (col) => col.notNull())
		.addColumn('entity_id', 'varchar')
		.addColumn('entity_type', 'text')
		.addColumn('date', 'timestamp', (col) => col.notNull())
		.addColumn('data', 'jsonb', (col) => col.notNull())
		.addColumn('date_created', 'timestamp')
		.addColumn('date_updated', 'timestamp')
		.execute();

	await db.schema.createIndex('notification_date_index').on('notification').column('date').execute();
	await db.schema.createIndex('notification_entity_id_entity_type_index').on('notification').columns(['entity_id', 'entity_type']).execute();
	await db.schema.createIndex('notification_entity_id_entity_type_date_index').on('notification').columns(['entity_id', 'entity_type', 'date']).execute();

}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('notification').execute();
}
