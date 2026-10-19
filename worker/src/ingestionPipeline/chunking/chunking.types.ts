export interface Chunk {
  sectionPath: string; // matches the Prisma column — headingPath joined with " > "
  sectionLevel: number; // matches `depth`
  chunkIndex: number; // which piece this is, 0-based, within its section
  pageStart: number | null;
  pageEnd: number | null;
  text: string;
}
