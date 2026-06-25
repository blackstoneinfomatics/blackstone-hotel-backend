export interface BaseClaims {
  name: string;
  email: string;
  tenantId: string | null;
  roles: string[];
  roleIds :string[];
  sessionId: string;
  deviceId: string;
  platform:string
}

export interface JwtClaims extends BaseClaims {
  tokenType: 'access' | 'refresh';
}

export interface JwtVerifyClaims extends BaseClaims{
  tokenType:string
   sub: string;
  jti: string;
  iat: number;
}