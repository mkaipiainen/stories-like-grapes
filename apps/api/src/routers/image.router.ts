import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { db } from '../db/db';
import { ZodEntityType } from '../constants/entity.constant';
import {awsService} from "../services/aws.service";
import {GUID} from "../util/guid";

export const imageRouter = router({
  getS3Url: publicProcedure.input(z.string()).query(async ({input: id}) => {
    const presignedUrl = await awsService.generateS3Url(id, 'GET');
    return presignedUrl
  }),
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

  create: publicProcedure
    .input(z.object({
      entityType: z.optional(ZodEntityType),
      entityId: z.optional(z.string()),
      imageData: z.string(), // Base64 encoded image data
      filename: z.string(),
      mimeType: z.string().regex(/^image\//), // Ensure it starts with "image/"
    }))
    .mutation(async ({ input }) => {
      // Convert base64 to Buffer
      const base64Data = input.imageData.split(',')[1];
      if (!base64Data) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid base64 image data',
        });
      }
      const buffer = Buffer.from(base64Data, 'base64');
      const id = GUID();
      const url = await awsService.generateS3Url(id, 'PUT');
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': input.mimeType,
        },
        body: buffer
      });
      // Insert the new image record into the database
      const newImage = await db
        .insertInto('image')
        .values({
          entity_type: input.entityType,
          entity_id: input.entityId,
          id: id,
          filename: input.filename,
          mime_type: input.mimeType,
          url: url, // Store the S3 URL in the database
        })
        .returningAll()
        .executeTakeFirst();

      return newImage;
    }),
});
