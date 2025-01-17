import { router } from '../trpc';
import { protectedProcedure } from '../procedures/protected.procedure';
import { authService } from '../services/auth.service';
import type { RawUser } from '../db/types/auth';
import { db } from '../db/db';
import { TENANT_ENTITY_TYPE } from '../constants/entity.constant';
import { TENANT_ROLES } from '../constants/tenant.constant';
import { GUID } from '../util/guid';

export const authRouter = router({
  list: protectedProcedure.query(async () => {
    const token = await authService.getManagementApiToken();
    const domain = process.env.AUTH0_DOMAIN; // e.g. "YOUR_TENANT.us.auth0.com"
    try {
      const response = await fetch(`https://${domain}/api/v2/users`, {
        method: 'GET',
        headers: {
          // Authorization header must have a valid Bearer token for the Management API
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch users. Status Code: ${response.status}`,
        );
      }

      // Parse the JSON response
      const users = (await response.json()) as RawUser[];
      return (
        users.map((user) => {
          return {
            id: user.user_id,
            name: user.name,
            picture: user.picture,
            last_login: user.last_login,
            created_at: user.created_at,
            email_verified: user.email_verified,
            nickname: user.nickname,
            email: user.email,
          };
        }) ?? []
      );
    } catch (e) {
      console.log(e);
      return [];
    }
  }),
  initUserData: protectedProcedure.mutation(async (opts) => {
    const user = opts.ctx.user;
    const existingTenant = await db
      .selectFrom('tenant_entity')
      .select('id')
      .where('entity_id', '=', opts.ctx.userId)
      .where('entity_type', '=', TENANT_ENTITY_TYPE.USER)
      .executeTakeFirst();
    console.log('CALLING', user);

    if (!existingTenant) {
      const tenant = await db
        .insertInto('tenant')
        .values({
          name: GUID(),
        })
        .onConflict()
        .returningAll()
        .executeTakeFirst();
      console.log(tenant);
      if (!tenant) {
        console.error('Failed to create a tenant for a user');
      } else {
        await db
          .insertInto('tenant_entity')
          .values({
            entity_type: TENANT_ENTITY_TYPE.USER,
            entity_id: opts.ctx.userId,
            role: TENANT_ROLES.owner,
            tenant_id: tenant.id,
          })
          .execute();
      }
    }
    const existingCalendar = await db
      .selectFrom('calendar')
      .select('id')
      .where('user_id', '=', opts.ctx.userId)
      .executeTakeFirst();
    if (!existingCalendar) {
      await db
        .insertInto('calendar')
        .values({
          user_id: opts.ctx.userId,
          name: `${user.name}'s Calendar`,
        })
        .execute();
    }
  }),
});
