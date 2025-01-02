import { ColumnType, Generated, Selectable } from 'kysely';

export type AuditTable = {
  id: Generated<string>;
  user_id: string | null;
  date: ColumnType<Date, never, never>;
  action: string;
  before: ColumnType<Record<string, any>, string, string> | null;
  after: ColumnType<Record<string, any>, string, string>;
  table_name: string;
  entity_id: string;
};

export type Audit = Selectable<AuditTable>;
