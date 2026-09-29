export type DetectionMethod =
  | "markdown-headings" // DOCX: real Word heading styles
  | "numbered-headings" // lines like "3.1 Material Inspection"
  | "page-fallback" // no headings found → one section per PDF page
  | "document-fallback"; // no headings, no pages (DOCX) → whole file is one section

export interface Section {
  sectionNumber: string | null; // "3.1" exactly as printed; null if the heading has no number
  title: string; // "Material Inspection"
  headingPath: string[]; // breadcrumb: ["3 Procedure", "3.1 Material Inspection"]
  depth: number; // 1 = top level, 2 = sub-section
  content: string; // text under the heading
  pageStart: number | null; // null for DOCX — no page concept
  pageEnd: number | null;
  startOffset: number; // position in the joined text (for debugging/highlighting)
  endOffset: number;
  detectionMethod: DetectionMethod;
}
