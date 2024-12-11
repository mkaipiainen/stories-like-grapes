import { EntityType } from '../constants/entity.constant.js';
import { db } from '../db/db.js';

export class EntityService {
  static async hardDelete(entityType: EntityType, entityId: string) {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom(entityType).where('id', '=', entityId).execute();
      await trx.deleteFrom('image').where('entity_id', '=', entityId).where('entity_type', '=', entityType).execute();
      await trx.deleteFrom('tag').where('entity_id', '=', entityId).where('entity_type', '=', entityType).execute();
    })
  }
}