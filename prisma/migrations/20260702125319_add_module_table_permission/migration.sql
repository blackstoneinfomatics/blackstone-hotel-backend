/*
  Warnings:

  - You are about to drop the column `module` on the `permissions` table. All the data in the column will be lost.
  - Added the required column `moduleId` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "permissions_module_idx";

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "module",
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "permissions_moduleId_idx" ON "permissions"("moduleId");

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
