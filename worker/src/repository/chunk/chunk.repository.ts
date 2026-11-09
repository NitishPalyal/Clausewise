import type { EmbeddedChunk } from "../../ingestionPipeline/embedding/embedding.types.ts";
import { prisma } from "../../lib/prisma.ts";

export async function storeChunks(
  embedded: EmbeddedChunk[],
  documentVersionId: string,
  tenantId: string,
) {
  try {
    await prisma.chunk.createMany({
      data: embedded.map((c) => ({ ...c, documentVersionId, tenantId })),
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
