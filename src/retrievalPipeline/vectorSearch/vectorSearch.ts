// worker/src/rag/retrievalPipeline/vectorSearch/vectorSearch.ts
import { prisma } from "@/lib/prisma.ts";
import type { RetrievedChunk } from "./vectorSearch.types.ts";
import {
  DEFAULT_LIMIT,
  EMBEDDING_DIMENSIONS,
  MAX_LIMIT,
} from "@/shared/variable.ts";

function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

export async function vectorSearch(
  queryEmbedding: number[],
  tenantId: string,
  limit: number = DEFAULT_LIMIT,
): Promise<RetrievedChunk[]> {
  if (!tenantId) throw new Error("vectorSearch needs a tenantId");
  if (queryEmbedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `vectorSearch expected ${EMBEDDING_DIMENSIONS} numbers, got ${queryEmbedding.length}`,
    );
  }
  if (!queryEmbedding.every(Number.isFinite)) {
    throw new Error("vectorSearch expected only finite embedding values");
  }
  if (!Number.isFinite(limit)) {
    throw new RangeError("vectorSearch limit must be a finite number");
  }

  const vector = toVectorLiteral(queryEmbedding);
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);

  return prisma.$queryRaw<RetrievedChunk[]>`
    SELECT
      c."id", c."text", c."sectionPath", c."sectionLevel", c."chunkIndex",
      c."pageStart", c."pageEnd", c."documentVersionId",
      dv."documentId", dv."versionNumber", d."title" AS "documentTitle",
      (c."embedding" <=> ${vector}::vector) AS "distance"
    FROM "Chunk" c
    JOIN "DocumentVersion" dv ON dv."id" = c."documentVersionId"
    JOIN "Document" d ON d."id" = dv."documentId"
    WHERE c."tenantId" = ${tenantId}
      AND dv."isCurrent" = true
      AND c."embedding" IS NOT NULL
    ORDER BY c."embedding" <=> ${vector}::vector
    LIMIT ${safeLimit}::int
  `;
}
