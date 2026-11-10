import mammoth from "mammoth";

export async function extractDocxPreviewText(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}
