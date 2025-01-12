import type { PlantTable } from './plant';
import type { ImageTable } from './image';
import type { TagTable } from './tag';
import type { SubscriptionTable } from './subscription';
import type { TenantTable } from './tenant';
import type { NotificationTable } from './notification';
import type { AuditTable } from './audit';
import type { CalendarEventUserTable } from './calendar-event-user';
import type { CalendarEventTable } from './calendar-event';
import type { CalendarShareTable } from './calendar-share';
import type { CalendarTable } from './calendar';

export type Database = {
  plant: PlantTable;
  image: ImageTable;
  tag: TagTable;
  subscription: SubscriptionTable;
  tenant: TenantTable;
  notification: NotificationTable;
  audit: AuditTable;
  calendar: CalendarTable;
  calendar_event: CalendarEventTable;
  calendar_share: CalendarShareTable;
  calendar_event_user: CalendarEventUserTable;
};

export type Table = keyof Database;
