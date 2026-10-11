export interface RetrievedChunk {
  id: string;
  text: string;
  sectionPath: string;
  sectionLevel: number;
  chunkIndex: number;
  pageStart: number | null;
  pageEnd: number | null;
  documentVersionId: string;
  documentId: string;
  documentTitle: string;
  versionNumber: number;
  distance: number; // cosine distance: 0 = same direction, bigger = less similar
}
