/*
  Warnings:

  - The values [uploded] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('pending', 'uploading', 'failed', 'uploaded', 'delayed');
ALTER TABLE "public"."DocumentVersion" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "DocumentVersion" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "DocumentVersion" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
