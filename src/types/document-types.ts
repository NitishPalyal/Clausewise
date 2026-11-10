export type DocumentFileType = "pdf" | "docx";

export type DocumentPreviewVersion = {
  id: string;
  versionNumber: number;
  isCurrent: boolean;
  fileType: DocumentFileType | null;
};
