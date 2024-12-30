import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('image')
    .addColumn('is_main_image', 'boolean', (col) => col.defaultTo(false))
    .execute();
  const mainImageIds = await db
    .selectFrom('plant')
    .select('main_image_id')
    .where('main_image_id', 'is not', null)
    .execute();
  if (mainImageIds.length) {
    await db
      .updateTable('image')
      .set('is_main_image', true)
      .where(
        'id',
        'in',
        mainImageIds.map((e) => e.main_image_id),
      )
      .execute();
  }
  await db.schema.alterTable('plant').dropColumn('main_image_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('plant')
    .addColumn('main_image_id', 'uuid')
    .execute();

  const mainImages = await db
    .selectFrom('image')
    .select(['id', 'plant_id'])
    .where('is_main_image', '=', true)
    .execute();

  if (mainImages.length) {
    await Promise.all(
      mainImages.map(({ id, plant_id }) =>
        db
          .updateTable('plant')
          .set({ main_image_id: id })
          .where('id', '=', plant_id)
          .execute(),
      ),
    );
  }

  await db.schema.alterTable('image').dropColumn('is_main_image').execute();
}
