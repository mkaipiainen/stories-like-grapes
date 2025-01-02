import { router } from '../trpc';
import { z } from 'zod';
import { db } from '../db/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { entityService } from '../services/entity.service';
import { ENTITY_TYPE } from '../constants/entity.constant';
import { sql } from 'kysely';
import dayjs from 'dayjs';
import { protectedProcedure } from '../procedures/protected.procedure';
import { omit } from 'rambda';
import { plantService } from '../services/plant.service';
import { TRPCError } from '@trpc/server';
import { auditService } from '../services/audit.service';
import { ACTIONS } from '../constants/audit.constant';
import type { Plant } from '../db/types/plant';
export default router({
  list: protectedProcedure.query(async () => {
    return await db
      .selectFrom('plant')
      .selectAll('plant')
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom('image')
            .selectAll()
            .where('entity_id', '=', eb.ref('plant.id'))
            .where('entity_type', '=', ENTITY_TYPE.PLANT)
            .orderBy('id'),
        ).as('images'),
        jsonArrayFrom(
          eb
            .selectFrom('tag')
            .selectAll()
            .whereRef('tag.entity_id', '=', 'plant.id')
            .where('tag.entity_type', '=', ENTITY_TYPE.PLANT)
            .orderBy('tag.name'),
        ).as('tags'),
      ])
      .orderBy('plant.next_watering_date', 'asc')
      .execute();
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        watering_frequency: z.number(),
      }),
    )
    .mutation(async (options) => {
      // Create a user in the database
      const plant = (
        await db
          .insertInto('plant')
          .values({
            name: options.input.name,
            description: options.input.description,
            watering_frequency: options.input.watering_frequency,
            user_id: options.ctx.userId,
          })
          .returningAll()
          .execute()
      )[0];
      return plant;
    }),

  get: protectedProcedure.input(z.string()).query(async (opts) => {
    return await GetPlant(opts.input);
  }),

  water: protectedProcedure.input(z.string()).mutation(async (opts) => {
    return await auditService.withAudit<Plant>(
      {
        userId: opts.ctx.userId,
        table: 'plant',
        id: opts.input,
        action: ACTIONS.WATER,
      },
      async () => {
        const plant = await db
          .selectFrom('plant')
          .selectAll()
          .where('id', '=', opts.input)
          .executeTakeFirstOrThrow();
        const updatedPlant = await plantService.updateNextWateringDate(plant);
        return updatedPlant;
      },
    );
  }),
  delete: protectedProcedure.input(z.string()).mutation(async (opts) => {
    await entityService.hardDelete(ENTITY_TYPE.PLANT, opts.input);
    return { success: true };
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.optional(z.string()),
        description: z.optional(z.string()),
        tags: z.optional(z.array(z.string())),
        watering_frequency: z.optional(z.number()),
        main_image_id: z.optional(z.string()),
      }),
    )
    .mutation(async (opts) => {
      const plant = await db
        .updateTable('plant')
        .set(omit(['tags'], opts.input))
        .where('id', '=', opts.input.id)
        .returningAll()
        .execute();
      if (!plant[0]) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Could not find a plant for the given ID',
        });
      }
      await entityService.updatePolymorphicRelationships({
        entityType: ENTITY_TYPE.PLANT,
        entityId: opts.input.id,
        tags: opts.input.tags,
      });
      await plantService.updateNextWateringDate(plant[0]);
      return await GetPlant(opts.input.id);
    }),
  getLastWateredById: protectedProcedure
    .input(z.string())
    .query(async (opts) => {
      return (
        (
          await db
            .selectFrom('audit')
            .select('user_id')
            .where('table_name', '=', 'plant')
            .where('entity_id', '=', opts.input)
            .where('action', '=', 'WATER')
            .orderBy('date desc')
            .limit(1)
            .executeTakeFirst()
        )?.user_id ?? ''
      );
    }),
  getAuditLog: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string(),
      }),
    )
    .query((opts) => {
      return db
        .selectFrom('audit')
        .where('table_name', '=', 'plant')
        .where('entity_id', '=', opts.input.id)
        .execute();
    }),
});

async function GetPlant(id: string) {
  const plant = await db
    .selectFrom('plant')
    .selectAll('plant')
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom('image')
          .selectAll()
          .where('entity_id', '=', eb.ref('plant.id'))
          .where('entity_type', '=', ENTITY_TYPE.PLANT)
          .orderBy('id'),
      ).as('images'),
      jsonArrayFrom(
        eb
          .selectFrom('tag')
          .selectAll()
          .where('entity_id', '=', eb.ref('plant.id'))
          .where('entity_type', '=', ENTITY_TYPE.PLANT)
          .orderBy('id'),
      ).as('tags'),
    ])
    .where('id', '=', id)
    .executeTakeFirst();

  if (!plant) {
    throw new Error('Plant not found');
  }

  return plant;
}
