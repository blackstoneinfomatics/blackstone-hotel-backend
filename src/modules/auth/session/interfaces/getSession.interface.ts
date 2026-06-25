
export interface GetActiveSessionByIdResponse {
  id: string;

  tenantId: string | null;
  userId: string;

  deviceId: string;
  platform:string | null;
  accessTokenJti: string;
  refreshTokenJti: string;
  refreshExpiresAt: Date;

  loginAt: Date;
  lastAccessedAt: Date | null;
  logoutAt: Date | null;

  ipAddress: string;
  userAgent: string | null;

  isRevoked: boolean;
  revokedAt: Date | null;

  country: string | null;
  appVersion: string | null;
  deletedAt:Date | null;
  createdAt: Date;
  updatedAt: Date;
}