// worker/src/rag/detect-structure/detect-structure.ts
import type { Document } from "@langchain/core/documents";
import type { DetectionMethod, Section } from "./structure.types.ts";

/* ────────────────────────────────────────────────────────────────
   Settings — small numbers you can tune after testing on real SOPs
   ──────────────────────────────────────────────────────────────── */
const MAX_LINE_LENGTH = 200; // a longer line is a paragraph, never a heading
const MAX_TITLE_LENGTH = 100; // characters
const MAX_TITLE_WORDS = 12;
const MIN_MARKED_HEADINGS = 2; // DOCX with 2+ real Word headings = trustworthy structure
const MIN_NUMBERED_HEADINGS = 3; // 1–2 numbered lines are probably a list, not a structure

// "3.1 Material Inspection" → number "3.1", title "Material Inspection".
// Also matches "1. PURPOSE", "1) Purpose" and "1.0 PURPOSE". The title must start with a capital letter.
const NUMBERED_LINE = /^\s*(\d{1,2}(?:\.\d{1,2}){0,3})[.)]?\s+([A-Z].*?)\s*$/;

// "## Material Inspection" — how our DOCX extractor writes real Word headings
const MARKED_LINE = /^(#{1,6})\s+(.+?)\s*$/;

// A number typed inside a heading's text: "3.1 Material Inspection"
const LEADING_NUMBER = /^(\d{1,2}(?:\.\d{1,2}){0,3})[.)]?\s+(.+)$/;

/* ────────────────────────────────────────────────────────────────
   Small internal types
   ──────────────────────────────────────────────────────────────── */
interface Heading {
  lineStart: number; // where the heading line begins in the joined text
  lineEnd: number; // where it ends (just before the newline)
  depth: number;
  sectionNumber: string | null;
  title: string;
}

interface NumberedCandidate extends Heading {
  numbers: number[]; // "3.1" → [3, 1]
}

interface PageSpan {
  pageNumber: number | null; // null for DOCX
  start: number; // where this page's text begins in the joined text
  end: number; // where it ends
}

interface ChainNode {
  candidate: NumberedCandidate;
  length: number; // headings in the outline so far, counting this one
  previous: ChainNode | null;
}

/* ────────────────────────────────────────────────────────────────
   STEP 1 — join all pages into ONE string, but remember where each page is
   ──────────────────────────────────────────────────────────────── */
function joinPages(docs: Document[]): { text: string; spans: PageSpan[] } {
  let text = "";
  const spans: PageSpan[] = [];

  for (const doc of docs) {
    const start = text.length;
    text += doc.pageContent;
    spans.push({ pageNumber: readPageNumber(doc), start, end: text.length });
    text += "\n"; // separator between pages; it belongs to no page
  }
  return { text, spans };
}

function readPageNumber(doc: Document): number | null {
  const page: unknown = doc.metadata.loc?.pageNumber;
  return typeof page === "number" ? page : null;
}

// Which pages does the text between `start` and `end` touch?
function pagesTouched(start: number, end: number, spans: PageSpan[]) {
  const touched = spans.filter(
    (s) => s.pageNumber !== null && s.start < end && s.end > start,
  );
  return {
    pageStart: touched[0]?.pageNumber ?? null,
    pageEnd: touched[touched.length - 1]?.pageNumber ?? null,
  };
}

/* ────────────────────────────────────────────────────────────────
   STEP 2 — find heading lines
   ──────────────────────────────────────────────────────────────── */

// Split into lines but remember where each line starts in the joined text.
function splitLines(text: string): { line: string; start: number }[] {
  const lines: { line: string; start: number }[] = [];
  let start = 0;
  for (const line of text.split("\n")) {
    lines.push({ line, start });
    start += line.length + 1; // +1 for the "\n" we split on
  }
  return lines;
}

const cleanTitle = (raw: string) =>
  raw.replace(/\s+/g, " ").replace(/[\s:]+$/, "");

// Rule-of-thumb checks: does this text LOOK like a heading rather than a sentence?
function looksLikeHeadingText(title: string): boolean {
  if (title.length === 0 || title.length > MAX_TITLE_LENGTH) return false;
  if (title.split(" ").length > MAX_TITLE_WORDS) return false;
  if (/[.,;]$/.test(title)) return false; // sentences end with punctuation, headings don't
  if (/\.{3,}/.test(title)) return false; // "Purpose ........ 3" is a table-of-contents line
  return true;
}

// "3.1" → [3, 1].  "1.0" is just a top-level "1", a common style in manufacturing SOPs.
function parseNumbers(label: string): number[] {
  const parts = label.split(".").map(Number);
  if (parts.length === 2 && parts[1] === 0) return [parts[0] ?? 0];
  return parts;
}

// After heading `previous`, is `next` a heading that could really come next?
//   after 3   → 3.1 (first child) or 4 (next sibling)
//   after 3.1 → 3.1.1 (first child), 3.2 (next sibling) or 4 (next sibling of the parent)
function isValidNext(previous: number[], next: number[]): boolean {
  const depth = next.length;
  if (depth > previous.length + 1) return false; // can't skip a level: 3 → 3.1.1

  for (let i = 0; i < depth - 1; i++) {
    if (next[i] !== previous[i]) return false; // must stay under the same parents
  }

  const last = next[depth - 1];
  if (last === undefined) return false;
  if (depth === previous.length + 1) return last === 1; // first child must be x.1

  const before = previous[depth - 1];
  return before !== undefined && last === before + 1; // next sibling counts up by exactly 1
}

// From ALL numbered-looking lines, keep the longest run that counts up like a real outline
// (1 → 2 → 3 → 3.1 → 3.2 → 4 ...). Lines that break the counting (list steps, stray numbers) are dropped.
function longestValidOutline(
  candidates: NumberedCandidate[],
): NumberedCandidate[] {
  const nodes: ChainNode[] = [];
  let best: ChainNode | null = null;

  for (const candidate of candidates) {
    // Option A: start a new outline here (only top-level numbers can start one)
    let node: ChainNode | null =
      candidate.numbers.length === 1
        ? { candidate, length: 1, previous: null }
        : null;

    // Option B: continue the longest outline this line is allowed to follow
    for (const earlier of nodes) {
      if (!isValidNext(earlier.candidate.numbers, candidate.numbers)) continue;
      if (node === null || earlier.length + 1 >= node.length) {
        node = { candidate, length: earlier.length + 1, previous: earlier };
      }
    }

    if (node === null) continue; // this line cannot belong to any outline
    nodes.push(node);
    if (best === null || node.length >= best.length) best = node; // ties → the later one wins
  }

  // Walk backwards from the end of the best outline to collect its headings
  const outline: NumberedCandidate[] = [];
  for (let n = best; n !== null; n = n.previous) outline.unshift(n.candidate);
  return outline;
}

// Detector 1 — numbered headings: "1. Purpose", "3.1 Material Inspection" (PDFs, and typed DOCX numbers)
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

// Detector 2 — marked headings: "## Material Inspection" (DOCX with real Word heading styles)
function findMarkedHeadings(text: string): Heading[] {
  const headings: Heading[] = [];

  for (const { line, start } of splitLines(text)) {
    const match = MARKED_LINE.exec(line);
    if (!match) continue;
    const [, hashes, rawTitle] = match;
    if (!hashes || !rawTitle) continue;

    // Word may also contain a typed number: "## 3.1 Material Inspection"
    const typed = LEADING_NUMBER.exec(rawTitle);
    headings.push({
      lineStart: start,
      lineEnd: start + line.length,
      depth: hashes.length, // "##" = level 2
      sectionNumber: typed?.[1] ?? null,
      title: cleanTitle(typed?.[2] ?? rawTitle),
    });
  }
  return headings;
}

/* ────────────────────────────────────────────────────────────────
   STEP 3 — cut the text at every heading and build the sections
   ──────────────────────────────────────────────────────────────── */
const formatLabel = (h: Heading) =>
  h.sectionNumber ? `${h.sectionNumber} ${h.title}` : h.title;

function buildSections(
  text: string,
  headings: Heading[],
  spans: PageSpan[],
  method: DetectionMethod,
): Section[] {
  const sections: Section[] = [];

  // Text before the first heading (document title, revision table, ...) becomes a "Preamble"
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

  // One section per heading. `parents` remembers the headings above the current one.
  const parents: { depth: number; label: string }[] = [];

  headings.forEach((heading, i) => {
    const bodyStart = heading.lineEnd + 1; // skip the newline after the heading
    const bodyEnd = headings[i + 1]?.lineStart ?? text.length; // body runs until the next heading

    // A heading at the same or a deeper level than the last parent is not that parent's child
    while (
      parents.length > 0 &&
      (parents[parents.length - 1]?.depth ?? 0) >= heading.depth
    ) {
      parents.pop();
    }
    parents.push({ depth: heading.depth, label: formatLabel(heading) });

    const content = text.slice(bodyStart, bodyEnd).trim();
    if (!content) return; // heading with no text of its own (e.g. "3 Procedure" with only sub-sections)

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

/* ────────────────────────────────────────────────────────────────
   Fallbacks — never return nothing
   ──────────────────────────────────────────────────────────────── */

// PDF with no headings found: one section per page, so citations can still say "page 4"
function pageFallback(text: string, spans: PageSpan[]): Section[] {
  const sections: Section[] = [];
  for (const span of spans) {
    if (span.pageNumber === null) return []; // no page numbers (DOCX) → this fallback does not apply
    const content = text.slice(span.start, span.end).trim();
    if (!content) continue;
    sections.push({
      sectionNumber: null,
      title: `Page ${span.pageNumber}`,
      headingPath: [], // empty = "no structure known"
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

// DOCX with no headings found: the whole file is one section
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

/* ────────────────────────────────────────────────────────────────
   The one function the pipeline calls
   ──────────────────────────────────────────────────────────────── */
export function detectStructure(docs: Document[]): Section[] {
  if (docs.length === 0) return [];
  const { text, spans } = joinPages(docs);

  // Try 1 — real Word headings. Only trusted when the DOCX extractor says it marked them.
  if (docs.some((d) => d.metadata.headingFormat === "markdown")) {
    const marked = findMarkedHeadings(text);
    if (marked.length >= MIN_MARKED_HEADINGS) {
      return buildSections(text, marked, spans, "markdown-headings");
    }
  }

  // Try 2 — numbered headings ("3.1 Material Inspection")
  const numbered = findNumberedHeadings(text);
  if (numbered.length >= MIN_NUMBERED_HEADINGS) {
    return buildSections(text, numbered, spans, "numbered-headings");
  }

  // Try 3 (later) — ask Gemini to find the headings. It would plug in right here.

  // Last resort — never lose the text
  const byPage = pageFallback(text, spans);
  return byPage.length > 0 ? byPage : documentFallback(text);
}
