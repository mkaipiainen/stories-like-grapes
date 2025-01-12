// calendar-event-user.d.ts
import { ColumnType, Generated, Selectable } from 'kysely';

export type CalendarEventUserTable = {
  id: Generated<string>;
  event_id: string;
  user_id: string;
  status: string;
  date_created: ColumnType<Date, never, never>;
};

export type CalendarEventUser = Selectable<CalendarEventUserTable>;
