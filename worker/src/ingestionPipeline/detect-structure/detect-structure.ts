import type { Document } from "@langchain/core/documents";
import type {
  DetectionMethod,
  Section,
  ChainNode,
  Heading,
  NumberedCandidate,
  PageSpan,
} from "./detect-structure.types.ts";

// Require repeated formatting or numbering before treating text as an outline.
const MAX_LINE_LENGTH = 200; // Longer lines are treated as body text.
const MAX_TITLE_LENGTH = 100;
const MAX_TITLE_WORDS = 12;
const MIN_MARKED_HEADINGS = 2; // Require repeated DOCX heading styles.
const MIN_NUMBERED_HEADINGS = 3; // Avoid mistaking a short numbered list for an outline.

// Recognizes numbered headings while avoiding most numbered body text.
const NUMBERED_LINE = /^\s*(\d{1,2}(?:\.\d{1,2}){0,3})[.)]?\s+([A-Z].*?)\s*$/;

// DOCX headings are converted to Markdown before structure detection.
const MARKED_LINE = /^(#{1,6})\s+(.+?)\s*$/;

const LEADING_NUMBER = /^(\d{1,2}(?:\.\d{1,2}){0,3})[.)]?\s+(.+)$/;

/** Joins page text and records offsets so sections can retain page references. */
function joinPages(docs: Document[]): { text: string; spans: PageSpan[] } {
  let text = "";
  const spans: PageSpan[] = [];

  for (const doc of docs) {
    const start = text.length;
    text += doc.pageContent;
    spans.push({ pageNumber: readPageNumber(doc), start, end: text.length });
    text += "\n";
  }
  return { text, spans };
}

function readPageNumber(doc: Document): number | null {
  const page: unknown = doc.metadata.loc?.pageNumber;
  return typeof page === "number" ? page : null;
}

/** Returns the first and last PDF pages overlapped by a text range. */
function pagesTouched(start: number, end: number, spans: PageSpan[]) {
  const touched = spans.filter(
    (s) => s.pageNumber !== null && s.start < end && s.end > start,
  );
  return {
    pageStart: touched[0]?.pageNumber ?? null,
    pageEnd: touched[touched.length - 1]?.pageNumber ?? null,
  };
}

/** Splits text into lines while retaining each line's character offset. */
function splitLines(text: string): { line: string; start: number }[] {
  const lines: { line: string; start: number }[] = [];
  let start = 0;
  for (const line of text.split("\n")) {
    lines.push({ line, start });
    start += line.length + 1;
  }
  return lines;
}

const cleanTitle = (raw: string) =>
  raw.replace(/\s+/g, " ").replace(/[\s:]+$/, "");

/** Rejects long or sentence-like text that is unlikely to be a heading. */
function looksLikeHeadingText(title: string): boolean {
  if (title.length === 0 || title.length > MAX_TITLE_LENGTH) return false;
  if (title.split(" ").length > MAX_TITLE_WORDS) return false;
  if (/[.,;]$/.test(title)) return false;
  if (/\.{3,}/.test(title)) return false;
  return true;
}

/** Converts a section label to its numeric levels; treats "1.0" as level one. */
function parseNumbers(label: string): number[] {
  const parts = label.split(".").map(Number);
  if (parts.length === 2 && parts[1] === 0) return [parts[0] ?? 0];
  return parts;
}

/** Checks whether the next numbered heading follows the current outline. */
function isValidNext(previous: number[], next: number[]): boolean {
  const depth = next.length;
  if (depth > previous.length + 1) return false;

  for (let i = 0; i < depth - 1; i++) {
    if (next[i] !== previous[i]) return false;
  }

  const last = next[depth - 1];
  if (last === undefined) return false;
  if (depth === previous.length + 1) return last === 1;

  const before = previous[depth - 1];
  return before !== undefined && last === before + 1;
}

/** Keeps the longest consistently numbered outline and drops unrelated numbered lines. */
function longestValidOutline(
  candidates: NumberedCandidate[],
): NumberedCandidate[] {
  const nodes: ChainNode[] = [];
  let best: ChainNode | null = null;

  for (const candidate of candidates) {
    let node: ChainNode | null =
      candidate.numbers.length === 1
        ? { candidate, length: 1, previous: null }
        : null;

    for (const earlier of nodes) {
      if (!isValidNext(earlier.candidate.numbers, candidate.numbers)) continue;
      if (node === null || earlier.length + 1 >= node.length) {
        node = { candidate, length: earlier.length + 1, previous: earlier };
      }
    }

    if (node === null) continue;
    nodes.push(node);
    if (best === null || node.length >= best.length) best = node;
  }

  const outline: NumberedCandidate[] = [];
  for (let n = best; n !== null; n = n.previous) outline.unshift(n.candidate);
  return outline;
}

/** Finds numbered headings and retains only candidates that form a valid outline. */
function findNumberedHeadings(text: string): Heading[] {
  const candidates: NumberedCandidate[] = [];

  for (const { line, start } of splitLines(text)) {
    if (line.length > MAX_LINE_LENGTH) continue;

    const match = NUMBERED_LINE.exec(line);
    if (!match) continue;
    const [, label, rawTitle] = match;
    if (!label || !rawTitle) continue;

    const title = cleanTitle(rawTitle);
    if (!looksLikeHeadingText(title)) continue;

    const numbers = parseNumbers(label);
    candidates.push({
      lineStart: start,
      lineEnd: start + line.length,
      depth: numbers.length,
      sectionNumber: label,
      title,
      numbers,
    });
  }

  return longestValidOutline(candidates);
}

/** Finds DOCX headings marked by the extractor's Markdown conversion. */
function findMarkedHeadings(text: string): Heading[] {
  const headings: Heading[] = [];

  for (const { line, start } of splitLines(text)) {
    const match = MARKED_LINE.exec(line);
    if (!match) continue;
    const [, hashes, rawTitle] = match;
    if (!hashes || !rawTitle) continue;

    const typed = LEADING_NUMBER.exec(rawTitle);
    headings.push({
      lineStart: start,
      lineEnd: start + line.length,
      depth: hashes.length,
      sectionNumber: typed?.[1] ?? null,
      title: cleanTitle(typed?.[2] ?? rawTitle),
    });
  }
  return headings;
}

const formatLabel = (h: Heading) =>
  h.sectionNumber ? `${h.sectionNumber} ${h.title}` : h.title;

/** Builds section bodies and heading paths from the detected heading lines. */
function buildSections(
  text: string,
  headings: Heading[],
  spans: PageSpan[],
  method: DetectionMethod,
): Section[] {
  const sections: Section[] = [];

  const firstHeadingStart = headings[0]?.lineStart ?? text.length;
  const preamble = text.slice(0, firstHeadingStart).trim();
  if (preamble) {
    sections.push({
      sectionNumber: null,
      title: "Preamble",
      headingPath: ["Preamble"],
      depth: 1,
      content: preamble,
      ...pagesTouched(0, firstHeadingStart, spans),
      startOffset: 0,
      endOffset: firstHeadingStart,
      detectionMethod: method,
    });
  }

  const parents: { depth: number; label: string }[] = [];

  headings.forEach((heading, i) => {
    const bodyStart = heading.lineEnd + 1;
    const bodyEnd = headings[i + 1]?.lineStart ?? text.length;

    // Keep only headings that can be parents of the current level.
    while (
      parents.length > 0 &&
      (parents[parents.length - 1]?.depth ?? 0) >= heading.depth
    ) {
      parents.pop();
    }
    parents.push({ depth: heading.depth, label: formatLabel(heading) });

    const content = text.slice(bodyStart, bodyEnd).trim();
    // Keep empty headings in the parent stack so child paths remain complete.
    if (!content) return;

    sections.push({
      sectionNumber: heading.sectionNumber,
      title: heading.title,
      headingPath: parents.map((p) => p.label),
      depth: heading.depth,
      content,
      ...pagesTouched(heading.lineStart, bodyEnd, spans),
      startOffset: heading.lineStart,
      endOffset: bodyEnd,
      detectionMethod: method,
    });
  });

  return sections;
}

/** Uses page boundaries when a PDF has no reliable headings. */
function pageFallback(text: string, spans: PageSpan[]): Section[] {
  const sections: Section[] = [];
  for (const span of spans) {
    // DOCX has no page boundaries, so it uses the whole-document fallback.
    if (span.pageNumber === null) return [];
    const content = text.slice(span.start, span.end).trim();
    if (!content) continue;
    sections.push({
      sectionNumber: null,
      title: `Page ${span.pageNumber}`,
      headingPath: [],
      depth: 1,
      content,
      pageStart: span.pageNumber,
      pageEnd: span.pageNumber,
      startOffset: span.start,
      endOffset: span.end,
      detectionMethod: "page-fallback",
    });
  }
  return sections;
}

/** Keeps an unstructured document searchable as a single section. */
function documentFallback(text: string): Section[] {
  const content = text.trim();
  if (!content) return [];
  return [
    {
      sectionNumber: null,
      title: "Document",
      headingPath: [],
      depth: 1,
      content,
      pageStart: null,
      pageEnd: null,
      startOffset: 0,
      endOffset: text.length,
      detectionMethod: "document-fallback",
    },
  ];
}

/** Detects document sections, falling back to page or whole-document boundaries. */
export function detectStructure(docs: Document[]): Section[] {
  if (docs.length === 0) return [];
  const { text, spans } = joinPages(docs);

  if (docs.some((d) => d.metadata.headingFormat === "markdown")) {
    const marked = findMarkedHeadings(text);
    if (marked.length >= MIN_MARKED_HEADINGS) {
      return buildSections(text, marked, spans, "markdown-headings");
    }
  }

  const numbered = findNumberedHeadings(text);
  if (numbered.length >= MIN_NUMBERED_HEADINGS) {
    return buildSections(text, numbered, spans, "numbered-headings");
  }

  const byPage = pageFallback(text, spans);
  return byPage.length > 0 ? byPage : documentFallback(text);
}
