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

export interface Heading {
  lineStart: number; // where the heading line begins in the joined text
  lineEnd: number; // where it ends (just before the newline)
  depth: number;
  sectionNumber: string | null;
  title: string;
}

export interface NumberedCandidate extends Heading {
  numbers: number[]; // "3.1" → [3, 1]
}

export interface PageSpan {
  pageNumber: number | null; // null for DOCX
  start: number; // where this page's text begins in the joined text
  end: number; // where it ends
}

export interface ChainNode {
  candidate: NumberedCandidate;
  length: number; // headings in the outline so far, counting this one
  previous: ChainNode | null;
}
