import { router } from '../trpc';
import { protectedProcedure } from '../procedures/protected.procedure';
import { authService } from '../services/auth.service';

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
      const users = await response.json();
      return users;
    } catch (e) {
      console.log(e);
    }
  }),
});
