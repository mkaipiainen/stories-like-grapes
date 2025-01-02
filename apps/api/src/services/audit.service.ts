import { db } from '../db/db';
import type { Table } from '../db/types/database';
import type { Action } from '../constants/audit.constant';

function AuditService() {
  async function withAudit<T>(
    data: {
      userId: string;
      action: Action;
      table: Table;
      id: string;
    },
    action: () => Promise<T>,
  ) {
    const before = await getRow({
      table: data.table,
      id: data.id,
    });
    const result = await action();

    const after = await getRow({
      table: data.table,
      id: data.id,
    });
    await db
      .insertInto('audit')
      .values({
        user_id: data.userId,
        table_name: data.table,
        before: before ? JSON.stringify(before) : null,
        action: data.action,
        after: JSON.stringify(after),
        entity_id: data.id,
      })
      .execute();
    return result;
  }

  async function getRow(data: { table: Table; id: string }) {
    return await db
      .selectFrom(data.table)
      .selectAll()
      .where('id', '=', data.id)
      .executeTakeFirstOrThrow();
  }

  return {
    withAudit,
  };
}

export const auditService = AuditService();
