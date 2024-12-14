import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { db } from '../db/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres'
import { EntityService } from '../services/delete.service';
import { ENTITY_TYPE } from '../constants/entity.constant';
export default router({
  list: publicProcedure.query(async () => {
    return await db.selectFrom('plant').selectAll('plant').select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('image')
          .selectAll()
          .where('entity_id', '=', eb.ref('plant.id'))
          .where('entity_type', '=', ENTITY_TYPE.PLANT)
          .orderBy('id')
      ).as('images'),
      jsonArrayFrom(
        eb.selectFrom('tag')
          .selectAll()
          .whereRef('tag.entity_id', '=', 'plant.id')
          .where('tag.entity_type', '=', ENTITY_TYPE.PLANT)
          .orderBy('tag.name')
      ).as('tags')]).execute();
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), description: z.string(), watering_frequency: z.number() }))
    .mutation(async (options) => {
      // Create a user in the database
      const plant = (await db.insertInto('plant').values({
        name: options.input.name,
        description: options.input.description,
        watering_frequency: options.input.watering_frequency,
      }).returningAll().execute())[0];
      return plant;
    }),
  get: publicProcedure
    .input(z.string())
    .query(async (opts) => {
      const plant = await db
        .selectFrom('plant')
        .selectAll('plant')
        .select((eb) => [
          jsonArrayFrom(
            eb.selectFrom('image')
              .selectAll()
              .where('entity_id', '=', eb.ref('plant.id'))
              .where('entity_type', '=', ENTITY_TYPE.PLANT)
              .orderBy('id')
          ).as('images'),
          jsonArrayFrom(
            eb.selectFrom('tag')
              .selectAll()
              .where('entity_id', '=', eb.ref('plant.id'))
              .where('entity_type', '=', ENTITY_TYPE.PLANT)
              .orderBy('id')
          ).as('tags'),
        ])
        .where('id', '=', opts.input)
        .executeTakeFirst();

      if (!plant) {
        throw new Error('Plant not found');
      }

      return plant;
    }),

  delete: publicProcedure
    .input(z.string())
    .mutation(async (opts) => {
      await EntityService.hardDelete(ENTITY_TYPE.PLANT, opts.input);
      return { success: true };
    }),
});
