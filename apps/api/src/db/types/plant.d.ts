import { ColumnType, GeneratedAlways, Selectable } from 'kysely';
import { Image } from './image';
import {Tag} from "./tag";

export type PlantTable = {
  id: GeneratedAlways<string>;
  name: string;
  watering_frequency: number | undefined;
  date_created: ColumnType<Date, never, never>;
  date_updated: ColumnType<Date, never, never>;
  last_watered: ColumnType<Date | undefined, string | undefined, string | undefined>;
  description: string | undefined;
  next_watering_date: Date | undefined;
};

export type Plant = Selectable<PlantTable> & {
  tags: Tag[];
  images: Image[];
};
