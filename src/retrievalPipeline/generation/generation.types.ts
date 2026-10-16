// src/retrievalPipeline/generation/generation.types.ts
export interface ChatTurn {
  role: "user" | "ai"; // matches MessageRole exactly as stored
  content: string;
}

export interface GenerationResult {
  answer: string;
  rawCitations: { marker: number; chunkIndex: number }[];
}
