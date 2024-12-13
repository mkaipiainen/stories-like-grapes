import { type EntityType } from '../constants/entity.constant';
import { db } from '../db/db';
import {awsService} from "./aws.service";

export class EntityService {
  static async hardDelete(entityType: EntityType, entityId: string) {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom(entityType).where('id', '=', entityId).execute();
      const image = await trx.selectFrom('image').select('id').where('entity_id', '=', entityId).where('entity_type', '=', entityType).executeTakeFirst();
      console.log(image);
      if(image) {
        const url = await awsService.generateS3Url(image.id, 'DELETE');
        await fetch(url, { method: 'DELETE'});
        await trx.deleteFrom('image').where('entity_id', '=', entityId).where('entity_type', '=', entityType).execute();
      }

      await trx.deleteFrom('tag').where('entity_id', '=', entityId).where('entity_type', '=', entityType).execute();
    })
  }
}