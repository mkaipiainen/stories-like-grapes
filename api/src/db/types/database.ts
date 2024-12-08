import { PlantTable } from './plant';
import { ImageTable } from './image';
import { TagTable } from './tag';

export type Database = {
  plant: PlantTable;
  image: ImageTable;
  tag: TagTable;
}