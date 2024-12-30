import type { PlantTable } from './plant';
import type { ImageTable } from './image';
import type { TagTable } from './tag';
import type { SubscriptionTable } from './subscription';
import type { TenantTable } from './tenant';
import type { NotificationTable } from './notification';
import type { AuditTable } from './audit';

export type Database = {
  plant: PlantTable;
  image: ImageTable;
  tag: TagTable;
  subscription: SubscriptionTable;
  tenant: TenantTable;
  notification: NotificationTable;
  audit: AuditTable;
};

export type Table = keyof Database;
