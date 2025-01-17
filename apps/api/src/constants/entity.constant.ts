import { z } from 'zod';

export const ENTITY_TYPE = {
  PLANT: 'plant',
} as const;

export const TENANT_ENTITY_TYPE = {
  PLANT: 'plant',
  USER: 'user',
} as const;

export const ZodEntityType = z.enum([ENTITY_TYPE.PLANT]);
export const ZodTenantEntityType = z.enum([
  TENANT_ENTITY_TYPE.PLANT,
  TENANT_ENTITY_TYPE.USER,
]);
export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];
export type TenantEntityType =
  (typeof TENANT_ENTITY_TYPE)[keyof typeof TENANT_ENTITY_TYPE];
