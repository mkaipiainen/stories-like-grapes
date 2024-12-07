import { PlantTable, PlantTagTable } from './plant';

export type Database = {
  plant: PlantTable;
  plant_tag: PlantTagTable;
}