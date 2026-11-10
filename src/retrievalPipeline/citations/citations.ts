import type { RankedChunk } from "../rerank/rerank.types.ts";
import type { Citation } from "./citations.types.ts";

interface RawCitation {
  marker: number;
  chunkIndex: number;
}

/** Replaces model-provided chunk indices with citation details from ranked results. */
export function parseCitations(
  rawCitations: RawCitation[],
  rankedChunks: RankedChunk[],
): Citation[] {
  const citations: Citation[] = [];
  for (const raw of rawCitations) {
    const chunk = rankedChunks[raw.chunkIndex];
    if (!chunk) continue;
    citations.push({
      marker: raw.marker,
      sectionPath: chunk.sectionPath,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      documentTitle: chunk.documentTitle,
      versionNumber: chunk.versionNumber,
    });
  }
  return citations;
}
