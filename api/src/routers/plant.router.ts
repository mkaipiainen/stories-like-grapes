import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { db } from '../db/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres'
export default router({
  list: publicProcedure.query(async () => {
    return await db.selectFrom('plant').selectAll('plant').select((eb) => [
      // pets
      jsonArrayFrom(
        eb.selectFrom('plant_tag')
          .select(['plant_tag.name'])
          .whereRef('plant_tag.plant_id', '=', 'plant.id')
          .orderBy('plant_tag.name')
      ).as('tags')]).execute();
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), description: z.string(), watering_frequency: z.number(), tags: z.array(z.string()) }))
    .mutation(async (options) => {
      // Create a user in the database
      const plant = (await db.insertInto('plant').values({
        name: options.input.name,
        description: options.input.description,
        watering_frequency: options.input.watering_frequency,
      }).returningAll().execute())[0];

      await db.insertInto('plant_tag').values(options.input.tags.map(tag => {
        return {
          plant_id: plant.id,
          name: tag,
        }
      })).execute();
      return {
        ...plant,
        tags: options.input.tags,
      }
    }),
});
