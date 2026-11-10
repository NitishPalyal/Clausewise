import { fromPath } from "pdf2pic";
import { createWorker } from "tesseract.js";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import mammoth from "mammoth";
import { parse, type HTMLElement } from "node-html-parser";
import * as fs from "fs";
import * as path from "path";
import type { FileType } from "./extraction.types.ts";

function bufferToBlob(fileBuffer: Buffer): Blob {
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength,
  ) as ArrayBuffer;

  return new Blob([arrayBuffer], {
    type: "application/pdf",
  });
}

/** Renders PDF pages and uses OCR when the file has no usable embedded text. */
async function processWithOCR(fileBuffer: Buffer): Promise<Document[]> {
  const outputDocuments: Document[] = [];

  const tempDir = path.join(process.cwd(), "ocr_temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

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

    // Remove temporary files even if rendering or OCR stops early.
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }

    if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
      fs.rmdirSync(tempDir);
    }
  }

  return outputDocuments;
}

/** Reads embedded PDF text first and falls back to OCR for scanned documents. */
async function loadPDFFile(fileBuffer: Buffer): Promise<Document[]> {
  const pdfBlob = bufferToBlob(fileBuffer);
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

function tableToText(table: HTMLElement): string {
  return table
    .querySelectorAll("tr")
    .map((row) =>
      row
        .querySelectorAll("td, th")
        .map((c) => c.text.trim())
        .join(" | "),
    )
    .join("\n");
}

/** Preserves DOCX headings and tabular content in the text sent to indexing. */
function htmlToMarkdownText(html: string): string {
  const root = parse(html);
  const lines: string[] = [];
  for (const node of root.childNodes) {
    if (node.nodeType !== 1) continue;
    const el = node as HTMLElement;
    const tag = el.tagName?.toLowerCase();
    if (tag && /^h[1-6]$/.test(tag))
      lines.push(`${"#".repeat(Number(tag[1]))} ${el.text.trim()}`);
    else if (tag === "table") lines.push(tableToText(el));
    else if (tag === "ul" || tag === "ol")
      for (const li of el.querySelectorAll("li"))
        lines.push(`- ${li.text.trim()}`);
    else if (el.text.trim()) lines.push(el.text.trim());
  }
  return lines.join("\n\n");
}

/** Converts DOCX content to text while marking heading levels for section detection. */
async function loadDocxFile(fileBuffer: Buffer): Promise<Document[]> {
  const { value: html } = await mammoth.convertToHtml({ buffer: fileBuffer });
  const text = htmlToMarkdownText(html);
  return [
    new Document({
      pageContent: text,
      metadata: { headingFormat: "markdown" },
    }),
  ];
}

/** Extracts text from a supported file, using OCR when a PDF needs it. */
export async function extractText(fileBuffer: Buffer, fileType: FileType) {
  if (fileType === "docx") {
    const pages = await loadDocxFile(fileBuffer);
    return pages;
  }

  const pages = await loadPDFFile(fileBuffer);
  return pages;
}
