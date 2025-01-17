// calendar.d.ts
import { ColumnType, Generated, Selectable } from 'kysely';

export type CalendarTable = {
  id: Generated<string>;
  name: string;
  description: string | null;
  user_id: string;
  provider_type: string | null;
  provider_calendar_id: string | null;
  date_created: ColumnType<Date, never, never>;
  date_updated: ColumnType<Date, never, never>;
};

export type Calendar = Selectable<CalendarTable>;
