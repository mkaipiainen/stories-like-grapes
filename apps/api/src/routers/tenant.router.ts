import { router } from '../trpc';
import { protectedProcedure } from '../procedures/protected.procedure';
import { db } from '../db/db';
import { TENANT_ENTITY_TYPE } from '../constants/entity.constant';
import { z } from 'zod';
import { TENANT_ROLES } from '../constants/tenant.constant';

export const tenantRouter = router({
  listForUser: protectedProcedure.query(async (opts) => {
    const tenantIds = await db
      .selectFrom('tenant_entity')
      .select('tenant_id')
      .where('entity_id', '=', opts.ctx.userId)
      .where('entity_type', '=', TENANT_ENTITY_TYPE.USER)
      .execute();
    return await db
      .selectFrom('tenant')
      .selectAll()
      .where(
        'id',
        'in',
        tenantIds.map((t) => t.tenant_id),
      )
      .execute();
  }),
  create: protectedProcedure
    .input(
      z.object({
        userIds: z.optional(z.array(z.string())),
        userId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const allUsers = [
        ...new Set([...(opts.input.userIds ?? []), opts.input.userId]),
      ];
      const createdTenant = await db
        .insertInto('tenant')
        .values({
          name: opts.input.name,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      await Promise.all(
        allUsers.map((userId) => {
          return db
            .insertInto('tenant_entity')
            .values({
              entity_type: TENANT_ENTITY_TYPE.USER,
              entity_id: userId,
              tenant_id: createdTenant.id,
              role:
                userId === opts.ctx.userId
                  ? TENANT_ROLES.owner
                  : TENANT_ROLES.user,
            })
            .execute();
        }),
      );
      return createdTenant;
    }),
});
