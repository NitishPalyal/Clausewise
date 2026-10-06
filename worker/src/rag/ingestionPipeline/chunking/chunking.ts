// worker/src/rag/chunking/chunking.ts
import { getEncoding } from "js-tiktoken";
import type { Section } from "../detect-structure/structure.types.ts";
import type { Chunk } from "./chunking.types.ts";

const CHUNK_SIZE = 600;
const OVERLAP = 100;
const encoder = getEncoding("cl100k_base"); // one encoder, reused for the whole run

function toChunk(section: Section, text: string, chunkIndex: number): Chunk {
  return {
    sectionPath: section.headingPath.join(" > "),
    sectionLevel: section.depth,
    chunkIndex,
    pageStart: section.pageStart,
    pageEnd: section.pageEnd,
    text,
  };
}

export function chunkBySection(sections: Section[]): Chunk[] {
  const chunks: Chunk[] = [];

  for (const section of sections) {
    const tokens = encoder.encode(section.content);

    if (tokens.length <= CHUNK_SIZE) {
      chunks.push(toChunk(section, section.content, 0));
      continue;
    }

    let start = 0;
    let chunkIndex = 0;
    while (start < tokens.length) {
      const end = Math.min(start + CHUNK_SIZE, tokens.length);
      const pieceText = encoder.decode(tokens.slice(start, end));
      chunks.push(toChunk(section, pieceText, chunkIndex));
      chunkIndex++;
      if (end === tokens.length) break;
      start = end - OVERLAP;
    }
  }

  return chunks;
}
