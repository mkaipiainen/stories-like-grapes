import type { PlantTable } from './plant';
import type { ImageTable } from './image';
import type { TagTable } from './tag';

export type Database = {
  plant: PlantTable;
  image: ImageTable;
  tag: TagTable;
}