import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { db } from '../db/db';
import { ZodEntityType } from '../constants/entity.constant';

export const tagRouter = router({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      const tag = await db
        .selectFrom('tag')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found',
        });
      }

      return tag;
    }),

  getByEntity: publicProcedure
    .input(z.object({
      entityType: ZodEntityType,
      entityId: z.string(),
    }))
    .query(async ({ input }) => {
      const tags = await db
        .selectFrom('tag')
        .selectAll()
        .where('entity_type', '=', input.entityType)
        .where('entity_id', '=', input.entityId)
        .execute();

      return tags;
    }),
  create: publicProcedure
    .input(z.object({
      entityType: ZodEntityType,
      entityId: z.string(),
      name: z.string(), // Base64 encoded image data
    }))
    .mutation(async ({ input }) => {
      // Convert base64 to Buffer

      const tag = await db
        .insertInto('tag')
        .values({
          entity_type: input.entityType,
          entity_id: input.entityId,
          name: input.name,
        })
        .returning(['id', 'entity_type', 'entity_id', 'name'])
        .executeTakeFirst();

      return tag;
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const deletedTag = await db
        .deleteFrom('tag')
        .where('id', '=', input.id)
        .returning(['id', 'entity_type', 'entity_id', 'name'])
        .executeTakeFirst();

      if (!deletedTag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found',
        });
      }

      return deletedTag;
    }),
});
