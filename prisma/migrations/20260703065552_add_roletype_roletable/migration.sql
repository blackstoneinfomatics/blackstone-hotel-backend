-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('PLATFORM', 'TENANT');

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "roleType" "RoleType" NOT NULL DEFAULT 'PLATFORM';
