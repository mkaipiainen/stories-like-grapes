import { z } from 'zod';

export const ENTITY_TYPE = {
  PLANT: 'plant'
} as const;


export const ZodEntityType = z.enum([ENTITY_TYPE.PLANT]);
export type EntityType = typeof ENTITY_TYPE[keyof typeof ENTITY_TYPE];