import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('subscription')
		.addColumn('id', 'varchar', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('endpoint', 'varchar', (col) => col.notNull())
		.addColumn('p256dh', 'varchar', (col) => col.notNull())
		.addColumn('auth', 'varchar', (col) => col.notNull())
		.addColumn('user_id', 'varchar', (col) => col.notNull())
		.execute();

	await db.schema.createIndex('subscription_endpoint_unique_idx').on('subscription').column('endpoint').unique().execute();
	await db.schema.createIndex('subscription_user_id_idx').on('subscription').column('user_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('subscription').execute();
}
