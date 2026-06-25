-- CreateTable
CREATE TABLE "active_sessions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "accessTokenJti" TEXT NOT NULL,
    "refreshTokenJti" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "refreshExpiresAt" TIMESTAMP(3) NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3),
    "logoutAt" TIMESTAMP(3),
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "country" TEXT,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_sessions_accessTokenJti_key" ON "active_sessions"("accessTokenJti");

-- CreateIndex
CREATE UNIQUE INDEX "active_sessions_refreshTokenJti_key" ON "active_sessions"("refreshTokenJti");

-- CreateIndex
CREATE INDEX "active_sessions_userId_idx" ON "active_sessions"("userId");

-- CreateIndex
CREATE INDEX "active_sessions_tenantId_idx" ON "active_sessions"("tenantId");

-- CreateIndex
CREATE INDEX "active_sessions_deviceId_idx" ON "active_sessions"("deviceId");

-- CreateIndex
CREATE INDEX "active_sessions_accessTokenJti_idx" ON "active_sessions"("accessTokenJti");

-- CreateIndex
CREATE INDEX "active_sessions_refreshTokenJti_idx" ON "active_sessions"("refreshTokenJti");

-- CreateIndex
CREATE INDEX "active_sessions_isRevoked_idx" ON "active_sessions"("isRevoked");

-- CreateIndex
CREATE INDEX "active_sessions_loginAt_idx" ON "active_sessions"("loginAt");

-- AddForeignKey
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
