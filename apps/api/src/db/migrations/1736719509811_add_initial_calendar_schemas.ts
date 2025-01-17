import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Calendar table
  await db.schema
    .createTable('calendar')
    .addColumn('id', 'varchar', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('user_id', 'varchar', (col) => col.notNull())
    .addColumn('provider_type', 'varchar')
    .addColumn('provider_calendar_id', 'varchar')
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('date_updated', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();

  // Calendar Event table (no direct calendar reference)
  await db.schema
    .createTable('calendar_event')
    .addColumn('id', 'varchar', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('title', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('start_time', 'timestamp', (col) => col.notNull())
    .addColumn('end_time', 'timestamp')
    .addColumn('provider_type', 'varchar')
    .addColumn('provider_event_id', 'varchar')
    .addColumn('created_by', 'varchar', (col) => col.notNull())
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('date_updated', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();

  // Calendar Event Calendar join table (new!)
  await db.schema
    .createTable('calendar_event_calendar')
    .addColumn('id', 'varchar', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('calendar_id', 'varchar', (col) =>
      col.references('calendar.id').onDelete('cascade').notNull(),
    )
    .addColumn('event_id', 'varchar', (col) =>
      col.references('calendar_event.id').onDelete('cascade').notNull(),
    )
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();

  // Calendar Event User table (for participation status)
  await db.schema
    .createTable('calendar_event_user')
    .addColumn('id', 'varchar', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'varchar', (col) =>
      col.references('calendar_event.id').onDelete('cascade').notNull(),
    )
    .addColumn('user_id', 'varchar', (col) => col.notNull())
    .addColumn('status', 'varchar', (col) => col.notNull())
    .addColumn('date_created', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();

  // Create indices
  await db.schema
    .createIndex('calendar_user_id_idx')
    .on('calendar')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('calendar_event_start_time_idx')
    .on('calendar_event')
    .column('start_time')
    .execute();

  await db.schema
    .createIndex('calendar_event_calendar_idx')
    .on('calendar_event_calendar')
    .columns(['calendar_id', 'event_id'])
    .execute();

  await db.schema
    .createIndex('calendar_event_user_event_id_user_id_idx')
    .on('calendar_event_user')
    .columns(['event_id', 'user_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('calendar_event_user').execute();
  await db.schema.dropTable('calendar_event_calendar').execute();
  await db.schema.dropTable('calendar_event').execute();
  await db.schema.dropTable('calendar').execute();
}
