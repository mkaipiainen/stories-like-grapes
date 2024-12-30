import { ColumnType, Generated, Selectable } from 'kysely';
import { EntityType } from '../../constants/entity.constant';

export type ImageTable = {
  id: Generated<string>;
  entity_type: EntityType | null;
  entity_id: string | null;
  url: string;
  filename: string | undefined;
  mime_type: string | undefined;
  date_created: ColumnType<Date, never, never>;
  is_main_image: boolean;
};

export type Image = Selectable<ImageTable>;
