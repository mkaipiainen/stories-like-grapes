import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('image')
    .addColumn('id', 'varchar', (col) => col.primaryKey())
    .addColumn('entity_type', 'varchar')
    .addColumn('entity_id', 'varchar')
    .addColumn('data', 'bytea', (col) => col.notNull())
    .addColumn('filename', 'varchar')
    .addColumn('mime_type', 'varchar')
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema.createIndex('entity_lookup_idx').on('image').columns(['entity_type', 'entity_id']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .dropTable('image')
    .execute()
}