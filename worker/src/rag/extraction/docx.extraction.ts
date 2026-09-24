import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import type { Document } from "@langchain/core/documents";

// 2. Function to process a Word (.docx) file
async function loadDocxFile(filePath: string): Promise<Document[]> {
  const loader = new DocxLoader(filePath);

  const docs: Document[] = await loader.load();
  return docs;
}
