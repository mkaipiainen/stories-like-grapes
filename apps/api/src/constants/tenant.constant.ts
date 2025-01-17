export const TENANT_ROLES = {
  owner: 'OWNER',
  user: 'USER',
} as const;

export type TenantRole = (typeof TENANT_ROLES)[keyof typeof TENANT_ROLES];
