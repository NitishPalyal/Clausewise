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
  distance: number; // Cosine distance from the query; lower values are more similar.
}
