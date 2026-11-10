import { describe, it, expect } from "vitest";
import { parseCitations } from "@/retrievalPipeline/citations/citations.ts";
import type { RankedChunk } from "@/retrievalPipeline/rerank/rerank.types.ts";

function makeRankedChunk(overrides: Partial<RankedChunk> = {}): RankedChunk {
  return {
    id: "chunk0",
    text: "Torque all M8 bolts to 24 Nm.",
    sectionPath: "3 Procedure > 3.1 Material Inspection",
    sectionLevel: 2,
    chunkIndex: 0,
    pageStart: 2,
    pageEnd: 2,
    documentVersionId: "ver1",
    documentId: "doc1",
    documentTitle: "SOP-014",
    versionNumber: 2,
    distance: 0.05,
    rank: 1,
    ...overrides,
  };
}

describe("parseCitations", () => {
  it("maps each raw citation's chunkIndex to the real metadata of that chunk", () => {
    const rankedChunks = [
      makeRankedChunk({
        sectionPath: "3 Procedure > 3.1 Material Inspection",
        pageStart: 2,
        pageEnd: 2,
      }),
      makeRankedChunk({
        sectionPath: "3 Procedure > 3.2 Machine Setup",
        pageStart: 3,
        pageEnd: 3,
      }),
    ];
    const citations = parseCitations(
      [
        { marker: 1, chunkIndex: 0 },
        { marker: 2, chunkIndex: 1 },
      ],
      rankedChunks,
    );
    expect(citations).toEqual([
      {
        marker: 1,
        sectionPath: "3 Procedure > 3.1 Material Inspection",
        pageStart: 2,
        pageEnd: 2,
        documentTitle: "SOP-014",
        versionNumber: 2,
      },
      {
        marker: 2,
        sectionPath: "3 Procedure > 3.2 Machine Setup",
        pageStart: 3,
        pageEnd: 3,
        documentTitle: "SOP-014",
        versionNumber: 2,
      },
    ]);
  });

  it("silently skips a citation pointing at an index that doesn't exist, instead of crashing", () => {
    const citations = parseCitations(
      [
        { marker: 1, chunkIndex: 0 },
        { marker: 2, chunkIndex: 7 },
      ],
      [makeRankedChunk()],
    );
    expect(citations).toHaveLength(1);
    expect(citations[0].marker).toBe(1);
  });

  it("returns an empty array when there are no raw citations at all", () => {
    expect(parseCitations([], [makeRankedChunk()])).toEqual([]);
  });
});
