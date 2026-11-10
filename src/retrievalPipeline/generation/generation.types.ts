export interface ChatTurn {
  role: "user" | "ai"; // Stored assistant turns use the "ai" role.
  content: string;
}

export interface GenerationResult {
  answer: string;
  rawCitations: { marker: number; chunkIndex: number }[];
}
