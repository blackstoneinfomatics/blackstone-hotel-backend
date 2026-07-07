// src/modules/authorization/constants/authorization.constants.ts

export const AuthorizationRedisKeys = {
  rolePermissions: (roleId: string) =>
    `role_permissions:${roleId}`,
};