import { ColumnType, Generated, Selectable } from 'kysely';

export type PlantTable = {
  id: Generated<number>;
  name: string;
  watering_frequency: number | undefined;
  date_created: Generated<ColumnType<Date, string, never>>;
  date_updated: Generated<ColumnType<Date, string, never>>;
  last_watered: ColumnType<Date | undefined, string | undefined, string | undefined>;
  description: string | undefined;
};

export type PlantTagTable = {
  id: Generated<number>;
  plant_id: number;
  name: string;
  date_created: Generated<ColumnType<Date, string, never>>;
}

export type Plant = Selectable<PlantTable> & {
  tags: string[];
};
export type PlantTag = Selectable<PlantTagTable>;