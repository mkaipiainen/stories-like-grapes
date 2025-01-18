import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex('calendar_user_id_unique_index')
    .on('calendar')
    .column('user_id')
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('calendar_user_id_unique_index').execute();
}
