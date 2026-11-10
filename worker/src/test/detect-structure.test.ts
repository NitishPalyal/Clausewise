import { describe, it, expect } from "vitest";
import { detectStructure } from "../ingestionPipeline/detect-structure/detect-structure.ts";
import type { Document } from "@langchain/core/documents";

function pdfDoc(pageContent: string, pageNumber = 1): Document {
  return { pageContent, metadata: { loc: { pageNumber } } } as Document;
}
function docxDoc(pageContent: string, markdown = false): Document {
  return {
    pageContent,
    metadata: markdown ? { headingFormat: "markdown" } : {},
  } as Document;
}

describe("detectStructure — numbered headings (PDF)", () => {
  it("rejects a stray number that doesn't fit the outline, absorbing its text into the real section", () => {
    const text = [
      "1 Purpose",
      "This defines how to inspect material.",
      "2 Scope",
      "Applies to all incoming material.",
      "3 Procedure",
      "3.1 Material Inspection",
      "Check the certificate and dimensions.",
      "7 Units",
      "3.2 Machine Setup",
      "Set the parameters before running.",
      "4 Records",
      "Keep logs for three years.",
    ].join("\n");
    const sections = detectStructure([pdfDoc(text)]);
    const titles = sections.map((s) => s.title);

    expect(titles).toEqual([
      "Purpose",
      "Scope",
      "Material Inspection",
      "Machine Setup",
      "Records",
    ]);
    expect(titles).not.toContain("Procedure");
    const materialInspection = sections.find(
      (s) => s.title === "Material Inspection",
    )!;
    expect(materialInspection.headingPath).toEqual([
      "3 Procedure",
      "3.1 Material Inspection",
    ]);
    expect(materialInspection.content).toContain("7 Units");
    expect(titles).not.toContain("Units");
  });

  it("excludes an orphaned heading (a missing number breaks the chain) into the Preamble, keeps the rest", () => {
    const text = [
      "1 Purpose",
      "This defines how material gets inspected.",
      "3 Procedure",
      "3.1 Material Inspection",
      "Check the certificate.",
      "3.2 Machine Setup",
      "Set the parameters.",
      "4 Records",
      "Keep logs for three years.",
      "5 Training",
      "Train new staff.",
      "6 Review",
      "Review this document yearly.",
    ].join("\n");
    const sections = detectStructure([pdfDoc(text)]);

    expect(sections[0]).toMatchObject({ title: "Preamble" });
    expect(sections[0]?.content).toContain("1 Purpose");
    expect(
      sections.every((s) => s.detectionMethod === "numbered-headings"),
    ).toBe(true);
    expect(sections.map((s) => s.title)).not.toContain("Purpose");
  });

  it("falls back to one section per page when too few real headings are found", () => {
    const sections = detectStructure([
      pdfDoc(
        "1 Purpose\nThis defines how material gets inspected.\n3 Procedure\nDo the thing.",
        1,
      ),
    ]);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      title: "Page 1",
      detectionMethod: "page-fallback",
      pageStart: 1,
    });
  });
});

describe("detectStructure — Word headings (DOCX)", () => {
  it("trusts real Word headings without any outline validation", () => {
    const text = [
      "# Purpose",
      "This defines how material gets inspected.",
      "# Procedure",
      "## Material Inspection",
      "Check the certificate and dimensions.",
      "## 3.2 Machine Setup",
      "Set the parameters before running.",
    ].join("\n");
    const sections = detectStructure([docxDoc(text, true)]);

    expect(sections.map((s) => s.title)).toEqual([
      "Purpose",
      "Material Inspection",
      "Machine Setup",
    ]);
    expect(
      sections.every((s) => s.detectionMethod === "markdown-headings"),
    ).toBe(true);
    const machineSetup = sections.find((s) => s.title === "Machine Setup")!;
    expect(machineSetup.sectionNumber).toBe("3.2");
  });

  it("falls all the way back to the whole document when there's no structure and no pages", () => {
    const sections = detectStructure([
      docxDoc("Just a short memo with no headings at all."),
    ]);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      title: "Document",
      detectionMethod: "document-fallback",
      pageStart: null,
    });
  });
});

describe("detectStructure — edge cases", () => {
  it("returns an empty array when given no documents at all", () => {
    expect(detectStructure([])).toEqual([]);
  });
});
