async function extractText(fileBuffer: Buffer, fileType: "pdf" | "docx") {
  if (fileType === "docx") {
    return await extractWithMammoth(fileBuffer); // always has real text
  }

  const pages = await extractWithPdfjs(fileBuffer);
  const avgCharsPerPage = totalChars(pages) / pages.length;

  if (avgCharsPerPage < 50) {
    return await extractWithOCR(fileBuffer); // pdf.js render → Tesseract.js
  }

  return pages; // born-digital, use as-is
}
