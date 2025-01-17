// calendar-event-calendar.d.ts
import { ColumnType, Generated, Selectable } from 'kysely';

export type CalendarEventCalendarTable = {
  id: Generated<string>;
  calendar_id: string;
  event_id: string;
  date_created: ColumnType<Date, never, never>;
};

export type CalendarEventCalendar = Selectable<CalendarEventCalendarTable>;
