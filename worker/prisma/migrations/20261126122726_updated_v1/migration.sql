-- DropForeignKey
ALTER TABLE "Chunk" DROP CONSTRAINT "Chunk_documentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentVersion" DROP CONSTRAINT "DocumentVersion_documentId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "citations" JSONB;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
