import { router } from '../trpc';
import { protectedProcedure } from '../procedures/protected.procedure';
import { authService } from '../services/auth.service';
import type { RawUser } from '../db/types/auth';

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
});
