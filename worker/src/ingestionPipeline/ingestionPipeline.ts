import { extractText } from "./extraction/extraction.service.ts";
import { detectStructure } from "./detect-structure/detect-structure.ts";
import { chunkBySection } from "./chunking/chunking.ts";
import { embedChunks } from "./embedding/embedding.ts";
import { prisma } from "../lib/prisma.ts";
import type {
  IngestionPipelineParams,
  IngestionProgress,
} from "./ingestionPipeline.types.ts";
import { downloadFromStorageService } from "../backblaze/backblaze.service.ts";

export async function ingestionPipline({
  uploadedFileKey,
  tenantId,
  documentVersionId,
  fileType,
  onProgress,
}: IngestionPipelineParams) {
  const reportProgress = async (progress: IngestionProgress) => {
    await onProgress?.(progress);
  };

  await reportProgress({
    stage: "downloading",
    percentage: 5,
    message: "Downloading document",
  });

  const docBuffer = await downloadFromStorageService(uploadedFileKey);

  await reportProgress({
    stage: "extracting",
    percentage: 15,
    message: "Extracting text from document",
  });

  const rawText = await extractText(docBuffer, fileType);

  await reportProgress({
    stage: "structuring",
    percentage: 30,
    message: "Detecting document structure",
  });

  const sections = detectStructure(rawText);

  await reportProgress({
    stage: "chunking",
    percentage: 40,
    message: "Splitting document into chunks",
  });

  const chunks = chunkBySection(sections);

  await reportProgress({
    stage: "embedding",
    percentage: 50,
    message: "Generating embeddings",
  });

  const embedded = await embedChunks(chunks);

  await reportProgress({
    stage: "saving",
    percentage: 90,
    message: "Saving document chunks",
  });

  await prisma.chunk.createMany({
    data: embedded.map((c) => ({ ...c, documentVersionId, tenantId })),
  });

  await reportProgress({
    stage: "saving",
    percentage: 100,
    message: "Document processing completed",
  });
}
