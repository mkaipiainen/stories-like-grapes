import { ColumnType, Generated, GeneratedAlways, Selectable } from 'kysely';

export type PlantTable = {
  id: GeneratedAlways<number>;
  name: string;
  watering_frequency: number | undefined;
  date_created: ColumnType<Date, never, never>;
  date_updated: ColumnType<Date, never, never>;
  last_watered: ColumnType<Date | undefined, string | undefined, string | undefined>;
  description: string | undefined;
};

export type PlantTagTable = {
  id: Generated<number>;
  plant_id: number;
  name: string;
  date_created: ColumnType<Date, never, never>;
}

export type Plant = Selectable<PlantTable> & {
  tags: {
    name: string;
  }[];
};
export type PlantTag = Selectable<PlantTagTable>;