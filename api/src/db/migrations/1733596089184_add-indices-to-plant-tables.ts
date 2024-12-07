import { CompiledQuery, Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	db.executeQuery(CompiledQuery.raw(`
create index plant_date_created_index
    on plant (date_created);

create index plant_id_index
    on plant (id);

create index plant_last_watered_index
    on plant (last_watered);

create index plant_watering_frequency_index
    on plant (watering_frequency);
`))
}

export async function down(db: Kysely<any>): Promise<void> {
	db.executeQuery(CompiledQuery.raw(`
		drop index plant_date_created_index;
		drop index plant_id_index;
		drop index plant_last_watered_index;
		drop index plant_watering_frequency_index;
`))
}
