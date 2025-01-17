import { GeneratedAlways, Selectable } from 'kysely';
import type { TenantEntityType } from '../../constants/entity.constant';

export type TenantEntityTable = {
  id: GeneratedAlways<string>;
  tenant_id: string;
  entity_id: string;
  entity_type: TenantEntityType;
  role: string;
};

export type TenantEntity = Selectable<TenantEntityTable>;
