// src/retrievalPipeline/rewrite/rewrite.schema.ts
import { Type, type Schema } from "@google/genai";

export const rewriteResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: { standaloneQuestion: { type: Type.STRING } },
  required: ["standaloneQuestion"],
};
