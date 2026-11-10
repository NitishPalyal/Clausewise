import { randomUUID } from "node:crypto";
import type { EmbeddedChunk } from "../../ingestionPipeline/embedding/embedding.types.ts";
import { prisma } from "../../lib/prisma.ts";

/** Saves a batch in one transaction so a failed insert does not leave partial results. */
export async function storeChunks(
  embedded: EmbeddedChunk[],
  documentVersionId: string,
  tenantId: string,
) {
  try {
    await prisma.$transaction(
      embedded.map((c) => {
        const vectorLiteral = `[${c.embedding.join(",")}]`;
        return prisma.$executeRaw`
          INSERT INTO "Chunk"
            (id, "tenantId", "documentVersionId", "sectionPath", "sectionLevel", "chunkIndex", "pageStart", "pageEnd", "text", "embedding")
          VALUES
            (${randomUUID()}, ${tenantId}, ${documentVersionId}, ${c.sectionPath}, ${c.sectionLevel}, ${c.chunkIndex}, ${c.pageStart}, ${c.pageEnd}, ${c.text}, ${vectorLiteral}::vector)
        `;
      }),
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}
