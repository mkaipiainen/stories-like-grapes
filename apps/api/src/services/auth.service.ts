import type { RawUser } from '../db/types/auth';

function AuthService() {
  async function getManagementApiToken() {
    const domain = process.env.AUTH0_DOMAIN; // e.g. "YOUR_TENANT.us.auth0.com"
    const clientId = process.env.AUTH0_M2M_CLIENT_ID; // from M2M application
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET; // from M2M application
    const audience = process.env.AUTH0_M2M_AUDIENCE; // Auth0 Management API audience

    const tokenUrl = `https://${domain}/oauth/token`;
    // Make a POST request to get the token
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId!,
        client_secret: clientSecret!,
        audience: audience!,
      }),
    };
    const response = await fetch(tokenUrl, options);

    if (!response.ok) {
      throw new Error(
        `Failed to get Management API token. Status: ${response.status}`,
      );
    }

    // The response contains several fields, but we only need the `access_token`.
    const data = await response.json();
    return data.access_token; // Bearer token
  }

  async function getUser(userId: string) {
    const token = await getManagementApiToken();
    const domain = process.env.AUTH0_DOMAIN;

    try {
      const response = await fetch(`https://${domain}/api/v2/users/${userId}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user. Status Code: ${response.status}`,
        );
      }

      const user = (await response.json()) as RawUser;
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
    } catch (e) {
      console.error('Error fetching user:', e);
      throw e;
    }
  }

  return {
    getManagementApiToken,
    getUser,
  };
}

export const authService = AuthService();
