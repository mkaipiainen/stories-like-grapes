import { router, publicProcedure } from '../trpc.js';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { db } from '../db/db.js';
import { ZodEntityType } from '../constants/entity.constant.js';

export const imageRouter = router({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      const image = await db
        .selectFrom('image')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!image) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Image not found',
        });
      }

      return image;
    }),

  getByEntity: publicProcedure
    .input(z.object({
      entityType: ZodEntityType,
      entityId: z.string(),
    }))
    .query(async ({ input }) => {
      const images = await db
        .selectFrom('image')
        .selectAll()
        .where('entity_type', '=', input.entityType)
        .where('entity_id', '=', input.entityId)
        .execute();

      return images;
    }),

  upload: publicProcedure
    .input(z.object({
      entityType: z.optional(ZodEntityType),
      entityId: z.optional(z.string()),
      imageData: z.string(), // Base64 encoded image data
      filename: z.string(),
      mimeType: z.string().regex(/^image\//), // Ensure it starts with "image/"
    }))
    .mutation(async ({ input }) => {
      // Convert base64 to Buffer
      const buffer = Buffer.from(input.imageData.split(',')[1], 'base64');

      const newImage = await db
        .insertInto('image')
        .values({
          entity_type: input.entityType,
          entity_id: input.entityId,
          image_data: buffer,
          filename: input.filename,
          mime_type: input.mimeType,
        })
        .returningAll()
        .executeTakeFirst();

      return newImage;
    }),
});
