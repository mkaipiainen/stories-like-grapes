import { ColumnType, Generated, Selectable } from 'kysely';

export type TenantTable = {
  id: Generated<string>;
  name: string;
  date_created: ColumnType<Date, never, never>;
  date_updated: ColumnType<Date, never, never>;
  is_default: ColumnType<boolean, boolean | undefined, boolean | undefined>;
  created_by: ColumnType<string, string, never>;
};

export type Tenant = Selectable<TenantTable>;
