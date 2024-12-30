import { z } from 'zod';
import { ZodEntityType } from '../constants/entity.constant';
import { TRPCError } from '@trpc/server';
import { GUID } from '../util/guid';
import { awsService } from './aws.service';
import { db } from '../db/db';

export const ZCreateImageData = z.object({
  entityType: z.optional(ZodEntityType),
  entityId: z.optional(z.string()),
  imageData: z.string(), // Base64 encoded image data
  filename: z.string(),
  mimeType: z.string().regex(/^image\//), // Ensure it starts with "image/"
});

type CreateImageData = z.infer<typeof ZCreateImageData>;
function ImageService() {
  async function create(data: CreateImageData) {
    const base64Data = data.imageData.split(',')[1];
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
        'Content-Type': data.mimeType,
      },
      body: buffer,
    });
    // Insert the new image record into the database

    const isMainImage =
      data.entityType && data.entityId
        ? !(
            await db
              .selectFrom('image')
              .where('entity_type', '=', data.entityType)
              .where('entity_id', '=', data.entityId)
              .where('is_main_image', '=', true)
              .selectAll()
              .execute()
          ).length
        : true;
    const newImage = await db
      .insertInto('image')
      .values({
        entity_type: data.entityType,
        entity_id: data.entityId,
        id: id,
        filename: data.filename,
        mime_type: data.mimeType,
        url: url, // Store the S3 URL in the database
        is_main_image: isMainImage,
      })
      .returningAll()
      .executeTakeFirst();
    return newImage;
  }
  return {
    create,
  };
}

export const imageService = ImageService();
