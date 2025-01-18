import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add is_default column
  await db.schema
    .alterTable('tenant')
    .addColumn('is_default', 'boolean', (col) => col.defaultTo(false))
    .execute();

  // Add created_by column
  await db.schema
    .alterTable('tenant')
    .addColumn('created_by', 'varchar(255)', (col) => col.notNull())
    .execute();

  // Create unique index on (created_by, is_default)
  await db.schema
    .createIndex('tenant_default_by_user_idx')
    .on('tenant')
    .columns(['created_by', 'is_default'])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the index first
  await db.schema.dropIndex('tenant_default_by_user_idx').execute();

  // Drop the columns
  await db.schema
    .alterTable('tenant')
    .dropColumn('created_by')
    .dropColumn('is_default')
    .execute();
}
