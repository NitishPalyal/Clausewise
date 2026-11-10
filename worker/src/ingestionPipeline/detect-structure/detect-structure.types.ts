export type DetectionMethod =
  | "markdown-headings" // Heading levels preserved from DOCX styles.
  | "numbered-headings" // A valid numbered outline was detected.
  | "page-fallback" // PDF pages are used when headings are unavailable.
  | "document-fallback"; // The full document is one section.

export interface Section {
  sectionNumber: string | null; // Original number from the heading, if present.
  title: string;
  headingPath: string[]; // Parent-to-child heading labels.
  depth: number; // Heading level, starting at 1.
  content: string;
  pageStart: number | null; // DOCX content has no page numbers.
  pageEnd: number | null;
  startOffset: number; // Character offset in the joined document text.
  endOffset: number;
  detectionMethod: DetectionMethod;
}

export interface Heading {
  lineStart: number; // Character offset in the joined document text.
  lineEnd: number;
  depth: number;
  sectionNumber: string | null;
  title: string;
}

export interface NumberedCandidate extends Heading {
  numbers: number[]; // Numeric levels parsed from the section label.
}

export interface PageSpan {
  pageNumber: number | null; // Null when the source has no page information.
  start: number; // Character offset in the joined document text.
  end: number; // End offset in the joined document text.
}

export interface ChainNode {
  candidate: NumberedCandidate;
  length: number; // Number of headings in this outline chain.
  previous: ChainNode | null;
}
