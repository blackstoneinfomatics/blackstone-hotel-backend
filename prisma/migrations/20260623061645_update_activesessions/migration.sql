/*
  Warnings:

  - You are about to drop the column `refreshTokenHash` on the `active_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "active_sessions" DROP COLUMN "refreshTokenHash";
