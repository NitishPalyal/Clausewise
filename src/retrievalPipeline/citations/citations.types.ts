export interface Citation {
  marker: number;
  sectionPath: string;
  pageStart: number | null;
  pageEnd: number | null;
  documentTitle: string;
  versionNumber: number;
}
