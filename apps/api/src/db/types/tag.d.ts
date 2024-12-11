import { ColumnType, Generated, Selectable } from 'kysely';
import { EntityType } from '../../constants/entity.constant';

export type TagTable = {
  id: Generated<string>;
  entity_type: EntityType | null;
  entity_id: string | null;
  name: string;
  date_created: ColumnType<Date, never, never>;
};

export type Tag = Selectable<TagTable>;