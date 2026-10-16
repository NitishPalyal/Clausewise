// src/retrievalPipeline/generation/generation.schema.ts
import { Type, type Schema } from "@google/genai";

export const generationResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    citations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          marker: { type: Type.INTEGER },
          chunkIndex: { type: Type.INTEGER },
        },
        required: ["marker", "chunkIndex"],
      },
    },
  },
  required: ["answer", "citations"],
};
