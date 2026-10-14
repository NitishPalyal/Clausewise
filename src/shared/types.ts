export type FileType = "pdf" | "docx";

export interface APIResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    details?: string;
  };
}
