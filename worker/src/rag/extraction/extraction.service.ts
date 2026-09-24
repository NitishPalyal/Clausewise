import { fromPath } from "pdf2pic";
import { createWorker } from "tesseract.js";
import { Document } from "@langchain/core/documents";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as fs from "fs";
import * as path from "path";
import type { FileType } from "./extraction.types.ts";

function bufferToBlob(fileBuffer: Buffer, fileType: FileType): Blob {
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength,
  ) as ArrayBuffer;

  if (fileType === "docx") {
    return new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  }

  return new Blob([arrayBuffer], {
    type: "application/pdf",
  });
}

async function processWithOCR(fileBuffer: Buffer): Promise<Document[]> {
  const outputDocuments: Document[] = [];

  const tempDir = path.join(process.cwd(), "ocr_temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Save the Buffer temporarily as a PDF
  const tempPdfPath = path.join(tempDir, "input.pdf");
  fs.writeFileSync(tempPdfPath, fileBuffer);

  const converterOptions = {
    density: 300,
    saveFilename: "page",
    savePath: tempDir,
    format: "png",
  };

  const convert = fromPath(tempPdfPath, converterOptions);

  const worker = await createWorker("eng");

  try {
    let pageNum = 1;
    let scanning = true;

    while (scanning) {
      try {
        const imageResult = await convert(pageNum);
        const imagePath = imageResult.path;

        if (!imagePath || !fs.existsSync(imagePath)) {
          scanning = false;
          break;
        }

        const {
          data: { text },
        } = await worker.recognize(imagePath);

        outputDocuments.push(
          new Document({
            pageContent: text,
            metadata: {
              loc: { pageNumber: pageNum },
              extractionMethod: "local_tesseract_ocr",
            },
          }),
        );

        fs.unlinkSync(imagePath);

        pageNum++;
      } catch (err) {
        scanning = false;
      }
    }
  } finally {
    await worker.terminate();

    // Delete temporary PDF
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }

    // Delete temp directory if empty
    if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
      fs.rmdirSync(tempDir);
    }
  }

  return outputDocuments;
}

async function loadPDFFile(fileBuffer: Buffer): Promise<Document[]> {
  const pdfBlob = bufferToBlob(fileBuffer, "pdf");
  const loader = new PDFLoader(pdfBlob, {
    splitPages: true,
  });

  const docs: Document[] = await loader.load();

  const totalPages = docs.length;

  if (totalPages === 0) {
    console.warn("⚠️ PDF contains 0 index nodes. Routing directly to OCR.");

    return await processWithOCR(fileBuffer);
  }

  let totalCharacters = 0;

  for (const doc of docs) {
    totalCharacters += doc.pageContent.length;
  }

  const averageCharsPerPage = Math.floor(totalCharacters / totalPages);

  if (averageCharsPerPage < 50) {
    return await processWithOCR(fileBuffer);
  }

  return docs;
}

async function loadDocxFile(fileBuffer: Buffer): Promise<Document[]> {
  const docxBlob = bufferToBlob(fileBuffer, "docx");

  const loader = new DocxLoader(docxBlob);

  const docs: Document[] = await loader.load();

  return docs;
}

export async function extractText(fileBuffer: Buffer, fileType: FileType) {
  if (fileType === "docx") {
    const pages = await loadDocxFile(fileBuffer);
    return pages; // always has real text
  }

  const pages = await loadPDFFile(fileBuffer);

  return pages; // born-digital, use as-is
}
