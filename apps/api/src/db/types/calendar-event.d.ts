// calendar-event.d.ts
import { ColumnType, Generated, Selectable } from 'kysely';

export type CalendarEventTable = {
  id: Generated<string>;
  calendar_id: string;
  title: string;
  description: string | null;
  start_time: ColumnType<Date, string, string>;
  end_time: ColumnType<Date, string | null, string | null>;
  provider_type: string | null;
  provider_event_id: string | null;
  created_by: string;
  date_created: ColumnType<Date, never, never>;
  date_updated: ColumnType<Date, never, never>;
};

export type CalendarEvent = Selectable<CalendarEventTable>;
