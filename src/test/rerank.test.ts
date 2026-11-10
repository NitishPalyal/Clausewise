import { describe, it, expect, vi } from "vitest";
import { rerankVectors } from "@/retrievalPipeline/rerank/rerank.ts";
import type { RetrievedChunk } from "@/retrievalPipeline/vectorSearch/vectorSearch.types.ts";

function makeCandidates(count: number): RetrievedChunk[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `chunk${i}`,
    text: `Passage number ${i}`,
    sectionPath: `Section ${i}`,
    sectionLevel: 1,
    chunkIndex: 0,
    pageStart: 1,
    pageEnd: 1,
    documentVersionId: "ver1",
    documentId: "doc1",
    documentTitle: "SOP-014",
    versionNumber: 2,
    distance: i * 0.05,
  }));
}

describe("rerank", () => {
  it("reorders candidates according to the ranking function, numbering ranks from 1", async () => {
    const candidates = makeCandidates(20);
    const result = await rerankVectors("query", candidates, async () => [
      14, 3, 7, 0, 11,
    ]);
    expect(result.map((c) => c.id)).toEqual([
      "chunk14",
      "chunk3",
      "chunk7",
      "chunk0",
      "chunk11",
    ]);
    expect(result.map((c) => c.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it("drops duplicate, out-of-range, and non-integer indices while keeping the valid ones, in order", async () => {
    const candidates = makeCandidates(20);
    const result = await rerankVectors("query", candidates, async () => [
      5, 5, 99, 2.5, 8, -1, 2,
    ]);
    expect(result.map((c) => c.id)).toEqual(["chunk5", "chunk8", "chunk2"]);
  });

  it("falls back to vector search's own order when the ranking function throws", async () => {
    const candidates = makeCandidates(20);
    const result = await rerankVectors("query", candidates, async () => {
      throw new Error("rate limited");
    });
    expect(result.map((c) => c.id)).toEqual([
      "chunk0",
      "chunk1",
      "chunk2",
      "chunk3",
      "chunk4",
    ]);
  });

  it("never returns more results than candidates actually exist, even with extra valid-looking indices", async () => {
    const candidates = makeCandidates(3);
    const result = await rerankVectors("query", candidates, async () => [
      1, 0, 2, 5, 8, 12,
    ]);
    expect(result).toHaveLength(3);
    expect(result.map((c) => c.id)).toEqual(["chunk1", "chunk0", "chunk2"]);
  });

  it("returns an empty array when there are no candidates to rank", async () => {
    const rankFn = vi.fn();
    expect(await rerankVectors("query", [], rankFn)).toEqual([]);
    expect(rankFn).not.toHaveBeenCalled();
  });
});
