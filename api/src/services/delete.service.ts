import { EntityType } from '../constants/entity.constant';
import { db } from '../db/db';

export class EntityService {
  static async hardDelete(entityType: EntityType, entityId: string) {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom(entityType).where('id', '=', entityId).execute();
      await trx.deleteFrom('image').where('entity_id', '=', entityId).where('entity_type', '=', entityType).execute();
      await trx.deleteFrom('tag').where('entity_id', '=', entityId).where('entity_type', '=', entityType).execute();
    })
  }
}