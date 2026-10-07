import { extractText } from "./extraction/extraction.service.ts";
import { detectStructure } from "./detect-structure/detect-structure.ts";
import { chunkBySection } from "./chunking/chunking.ts";
import { embedChunks } from "./embedding/embedding.ts";
import { prisma } from "../../lib/prisma.ts";
import type { FileType } from "./extraction/extraction.types.ts";

export async function ingestionPipline(
  fileBuffer: Buffer,
  fileType: FileType,
  documentVersionId: string,
  tenantId: string,
) {
  const rawText = await extractText(fileBuffer, fileType); // ← other thread
  const sections = detectStructure(rawText); // ← other thread
  const chunks = chunkBySection(sections); // ← other thread
  const embedded = await embedChunks(chunks); // ← other thread
  await prisma.chunk.createMany({
    data: embedded.map((c) => ({ ...c, documentVersionId, tenantId })),
  });
}
