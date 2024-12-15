import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('tenant')
		.addColumn('id', 'varchar', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
		.addColumn('date_updated', 'timestamp', (col) => col.defaultTo(sql`now()`))
		.addColumn('name', 'text', (col) => col.notNull()).execute();

	await db.schema.createTable('tenant_entity')
		.addColumn('id', 'varchar', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('tenant_id', 'varchar', (col) =>
			col.references('tenant.id').onDelete('cascade').notNull(),
		)
		.addColumn('entity_id', 'varchar', (col) => col.notNull())
		.addColumn('entity_type', 'varchar', (col) => col.notNull())
		.addColumn('role', 'varchar')
		.execute();

	await db.schema
		.alterTable('plant')
		.alterColumn('id', (col) => col.setDataType('varchar'))
		.addColumn('user_id', 'varchar').execute();

	await db.schema
		.alterTable('image')
		.alterColumn('id', (col) => col.setDataType('varchar'))
		.alterColumn('entity_id', (col) => col.setDataType('varchar')).execute();

	await db.schema
		.alterTable('subscription')
		.alterColumn('id', (col) => col.setDataType('varchar'))
		.execute();

	await db.schema
		.alterTable('tag')
		.alterColumn('id', (col) => col.setDataType('varchar'))
		.alterColumn('entity_id', (col) => col.setDataType('varchar'))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('plant').dropColumn('user_id').execute();
	await db.schema.dropTable('tenant_entity').execute();
	await db.schema.dropTable('tenant').execute();
}
