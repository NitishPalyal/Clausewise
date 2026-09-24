import type { Job } from "bullmq";
import { extractText } from "./extraction/extraction.service.ts";
// import { extractText } from "../extraction";
// import { detectStructure } from "../structure/detect-structure";
// import { chunkBySection } from "../chunking/chunk-sections";
// import { embedChunks } from "../embeddings/embed-chunks";
// import { prisma } from "../lib/prisma";

export async function ingestionPipline(
  documentVersionId: string,
  fileUrl: string,
) {
  const rawText = await extractText(); // ← other thread
  const sections = await detectStructure(rawText); // ← other thread
  const chunks = chunkBySection(sections); // ← other thread
  const embedded = await embedChunks(chunks); // ← other thread

  await prisma.chunk.createMany({
    data: embedded.map((c) => ({ ...c, documentVersionId })),
  });
}
