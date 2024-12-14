import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('plant').addColumn('next_watering_date', 'timestamp', (col) => col.defaultTo(sql`now()`)).execute()
	await db.schema.createIndex('plant_next_watering_date_idx').on('plant').column('next_watering_date').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropIndex('plant_next_watering_date_idx').on('plant').execute();
	await db.schema.alterTable('plant').dropColumn('next_watering_date').execute();
}
