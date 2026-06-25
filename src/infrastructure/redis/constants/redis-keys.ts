export const RedisKeys = {
  // Access Token JTI
  accessToken: (sessionId: string) =>
    `auth:access:${sessionId}`,

  // Refresh Token Hash
  refreshToken: (sessionId: string) =>
    `auth:refresh:${sessionId}`,

  // Session Cache
  session: (sessionId: string) =>
    `auth:session:${sessionId}`,

  // All sessions for a user
  userSessions: (userId: string) =>
    `auth:user:sessions:${userId}`,

  // Revoked Access Token
  revokedAccess: (jti: string) =>
    `auth:revoked:access:${jti}`,
   

  refreshBlacklist: (hashedJti: string) => 
    `refresh:blacklist:${hashedJti}`,

  //revoke userId
  revokedUser: (userId: string) => 
    `revoked:user:${userId}`,
  
  //devices list
  devices: (userId: string) => 
  `devices:${userId}`,

  // Revoked Refresh Token
  revokedRefresh: (jti: string) =>
    `auth:revoked:refresh:${jti}`,

  // Effective permissions
  userPermissions: (tenantId: string, userId: string) =>
    `auth:permissions:${tenantId}:${userId}`,

  // User roles
  userRoles: (tenantId: string, userId: string) =>
    `auth:roles:${tenantId}:${userId}`,

  // Role permissions
  rolePermissions: (roleId: string) =>
    `auth:role-permissions:${roleId}`,

  // Permission version
  permissionVersion: (tenantId: string) =>
    `auth:permission-version:${tenantId}`,

   oAuth : (state : string ) => `oauth:state:${state}`,


  // Socket Rooms
  socketUserRoom: (userId: string) =>
    `socket:user:${userId}`,

  socketDeviceRoom: (deviceId: string) =>
    `socket:device:${deviceId}`,
};