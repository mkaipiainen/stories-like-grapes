import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('audit')
    .addColumn('entity_id', 'varchar', (col) => col.notNull())
    .execute();
  await db.schema
    .createIndex('audit_entity_id_idx')
    .on('audit')
    .column('entity_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('audit_entity_id_idx').execute();
  await db.schema.alterTable('audit').dropColumn('entity_id').execute();
}
