import type { PlantTable } from './plant.js';
import type { ImageTable } from './image.js';
import type { TagTable } from './tag.js';

export type Database = {
  plant: PlantTable;
  image: ImageTable;
  tag: TagTable;
}