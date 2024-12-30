import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { db } from '../db/db';
import { ZodEntityType } from '../constants/entity.constant';
import { awsService } from '../services/aws.service';
import { GUID } from '../util/guid';
import { imageService, ZCreateImageData } from '../services/image.service';
import { protectedProcedure } from '../procedures/protected.procedure';
import { isNil } from 'rambda';

export const imageRouter = router({
  getS3Url: publicProcedure.input(z.string()).query(async ({ input: id }) => {
    const presignedUrl = await awsService.generateS3Url(id, 'GET');
    return presignedUrl;
  }),
  getById: publicProcedure.input(z.string()).query(async ({ input: id }) => {
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
    .input(
      z.object({
        entityType: ZodEntityType,
        entityId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const images = await db
        .selectFrom('image')
        .selectAll()
        .where('entity_type', '=', input.entityType)
        .where('entity_id', '=', input.entityId)
        .execute();

      return images;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        is_main_image: z.optional(z.boolean()),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.transaction().execute(async (trx) => {
        const updatedImage = await trx
          .updateTable('image')
          .where('id', '=', input.id)
          .set(input)
          .returningAll()
          .executeTakeFirst();
        if (isNil(updatedImage)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Could not find an image for the given ID',
          });
        }
        if (updatedImage && !isNil(input.is_main_image)) {
          if (input.is_main_image) {
            // Unset other main images for the same entity
            await trx
              .updateTable('image')
              .set('is_main_image', false)
              .where('id', '!=', input.id)
              .where('entity_id', '=', updatedImage.entity_id)
              .where('entity_type', '=', updatedImage.entity_type)
              .where('is_main_image', '=', true)
              .execute();
          } else {
            // Find another image for the same entity to set as main if this one is unset
            const nextMainImage = await trx
              .selectFrom('image')
              .selectAll()
              .where('id', '!=', input.id)
              .where('entity_id', '=', updatedImage.entity_id)
              .where('entity_type', '=', updatedImage.entity_type)
              .limit(1)
              .executeTakeFirst();

            if (nextMainImage) {
              await trx
                .updateTable('image')
                .set('is_main_image', true)
                .where('id', '=', nextMainImage.id)
                .execute();
            } else {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message:
                  'Could not set image to not be the main image for the entity - there are no other images to set as a new main image.',
              });
            }
          }
        }
        return updatedImage;
      });
    }),

  create: publicProcedure
    .input(ZCreateImageData)
    .mutation(async ({ input }) => {
      return imageService.create(input);
    }),
});
