import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import type { Document } from "@langchain/core/documents";

// 1. Function to process a PDF
async function loadPDFFile(filePath: string): Promise<Document[]> {
  // splitPages: true (default) generates one Document object per PDF page
  const loader = new PDFLoader(filePath, { splitPages: true });

  const docs: Document[] = await loader.load();
  const totalPages = docs.length;

  // Safeguard against edge cases where the file returns zero structural pages
  if (totalPages === 0) {
    console.warn("⚠️ PDF contains 0 index nodes. Routing directly to OCR.");
    return await processWithOCR(filePath);
  }

  // 2. Aggregate total characters from all extracted textual pages
  let totalCharacters = 0;
  for (const doc of docs) {
    totalCharacters += doc.pageContent.length;
  }

  // 3. Mathematical check: Calculate average characters per page and remainder
  const remainder = totalCharacters % totalPages;
  const averageCharsPerPage = Math.floor(totalCharacters / totalPages);

  console.log(`\n--- [PDF Processing Metrics] ---`);
  console.log(`📄 Total Pages      : ${totalPages}`);
  console.log(`🔤 Total Characters : ${totalCharacters}`);
  console.log(`📊 Modulo Remainder : ${remainder}`);
  console.log(`📈 Average Density  : ${averageCharsPerPage} characters/page\n`);

  // 4. Branching Logic: Escalate to OCR if average text density is < 50
  if (averageCharsPerPage < 50) {
    return await processWithOCR(filePath);
  }

  console.log(
    "✅ Text density is acceptable. Returning native text documents.",
  );
  return docs;
}
