// calendar-share.d.ts
import { ColumnType, Generated, Selectable } from 'kysely';

export type CalendarShareTable = {
  id: Generated<string>;
  calendar_id: string;
  user_id: string;
  permission_level: string;
  date_created: ColumnType<Date, never, never>;
};

export type CalendarShare = Selectable<CalendarShareTable>;
