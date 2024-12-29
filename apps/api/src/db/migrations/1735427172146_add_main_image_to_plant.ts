import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('plant')
    .addColumn('main_image_id', 'varchar', (col) =>
      col.references('image.id').onDelete('cascade'),
    )
    .execute();

  const subquery = db
    .selectFrom('image')
    .select(['id'])
    .where('entity_type', '=', 'plant')
    .distinctOn('entity_id') // Assuming your database supports DISTINCT ON
    .orderBy('entity_id') // To group by entity_id
    .orderBy('id') // To pick the first image by ID
    .limit(1);

  await db
    .updateTable('plant')
    .set({
      main_image_id: db
        .selectFrom('image')
        .select('id')
        .where('entity_type', '=', 'plant')
        .whereRef('image.entity_id', '=', 'plant.id')
        .limit(1),
    })
    .where('main_image_id', 'is', null)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('plant').dropColumn('main_image_id').execute();
}
