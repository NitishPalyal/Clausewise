export interface Chunk {
  sectionPath: string; // Heading labels joined with " > ".
  sectionLevel: number; // Source section's heading depth.
  chunkIndex: number; // Zero-based position within its section.
  pageStart: number | null;
  pageEnd: number | null;
  text: string;
}
