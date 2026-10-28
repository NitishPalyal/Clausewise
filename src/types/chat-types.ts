export interface Citation {
  marker: number;
  sectionPath: string;
  pageStart: number | null;
  pageEnd: number | null;
  documentTitle: string;
  versionNumber: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
  isLoading?: boolean;
}
