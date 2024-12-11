import { ColumnType, Generated, Selectable } from 'kysely';
import { EntityType } from '../../constants/entity.constant.js';

export type ImageTable = {
  id: Generated<string>;
  entity_type: EntityType | null;
  entity_id: string | null;
  image_data: Buffer;
  filename: string | undefined;
  mime_type: string | undefined;
  date_created: ColumnType<Date, never, never>;
};

export type Image = Selectable<ImageTable>;