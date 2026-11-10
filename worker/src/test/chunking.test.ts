import { describe, it, expect } from "vitest";
import { chunkBySection } from "../ingestionPipeline/chunking/chunking.ts";
import type { Section } from "../ingestionPipeline/detect-structure/detect-structure.types.ts";

function makeSection(overrides: Partial<Section> = {}): Section {
  return {
    sectionNumber: "1",
    title: "Purpose",
    headingPath: ["1 Purpose"],
    depth: 1,
    content: "Inspect material before it is accepted.",
    pageStart: 1,
    pageEnd: 1,
    startOffset: 0,
    endOffset: 40,
    detectionMethod: "numbered-headings",
    ...overrides,
  };
}

describe("chunkBySection", () => {
  it("returns exactly one chunk, unchanged, for a section under the size limit", () => {
    const section = makeSection();
    const chunks = chunkBySection([section]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      sectionPath: "1 Purpose",
      sectionLevel: 1,
      chunkIndex: 0,
      pageStart: 1,
      pageEnd: 1,
      text: section.content,
    });
  });

  it("splits an oversized section into multiple overlapping chunks, each indexed from 0", () => {
    const longText = Array(900)
      .fill("inspect the material carefully")
      .join(" ");
    const section = makeSection({
      headingPath: ["3 Procedure", "3.1 Material Inspection"],
      depth: 2,
      content: longText,
      pageStart: 2,
      pageEnd: 3,
    });
    const chunks = chunkBySection([section]);

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.sectionPath).toBe("3 Procedure > 3.1 Material Inspection");
      expect(chunk.pageStart).toBe(2);
      expect(chunk.pageEnd).toBe(3);
    }
    expect(chunks.map((c) => c.chunkIndex)).toEqual(chunks.map((_, i) => i));
    const overlapWords = chunks[0]!.text.trim().split(" ").slice(-5).join(" ");
    expect(chunks[1]!.text).toContain(overlapWords);
  });

  it("restarts chunkIndex at 0 for every new section, even when the previous one was split", () => {
    const longSection = makeSection({
      headingPath: ["3.1 Material Inspection"],
      content: Array(900).fill("inspect the material carefully").join(" "),
    });
    const shortSection = makeSection({
      headingPath: ["3.2 Machine Setup"],
      content: "Set the parameters before running.",
    });
    const chunks = chunkBySection([longSection, shortSection]);
    const lastOfFirstSection =
      chunks.filter((c) => c.sectionPath === "3.1 Material Inspection").length -
      1;

    expect(chunks[lastOfFirstSection]!.sectionPath).toBe(
      "3.1 Material Inspection",
    );
    expect(chunks[lastOfFirstSection + 1]).toMatchObject({
      sectionPath: "3.2 Machine Setup",
      chunkIndex: 0,
    });
  });

  it("returns an empty array for an empty section list", () => {
    expect(chunkBySection([])).toEqual([]);
  });
});
