import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('audit')
    .addColumn('id', 'varchar', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('user_id', 'varchar')
    .addColumn('table_name', 'varchar', (col) => col.notNull())
    .addColumn('date', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('before', 'jsonb')
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('after', 'jsonb', (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex('audit_action_index')
    .on('audit')
    .column('action')
    .execute();
  await db.schema
    .createIndex('audit_user_index')
    .on('audit')
    .column('user_id')
    .execute();
  await db.schema
    .createIndex('audit_table_index')
    .on('audit')
    .column('table_name')
    .execute();
  await db.schema
    .createIndex('audit_date_index')
    .on('audit')
    .column('date')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('audit_date_index').execute();
  await db.schema.dropIndex('audit_table_index').execute();
  await db.schema.dropIndex('audit_user_index').execute();
  await db.schema.dropIndex('audit_action_index').execute();
  await db.schema.dropTable('audit').execute();
}
