import { parseCitations } from "./citations/citations";
import { Citation } from "./citations/citations.types";
import { embedQuery } from "./embedding/embedding";
import { generateResponse } from "./generation/generation";
import { GenerationResult } from "./generation/generation.types";
import { rerankVectors } from "./rerank/rerank";
import { rewriteStandalone } from "./rewrite/rewrite";
import { vectorSearch } from "./vectorSearch/vectorSearch";
import * as MessageRepo from "@/repository/message/messages.repostory";

export async function retrievalPipeline(
  question: string,
  tenantId: string,
  chatId: string,
): Promise<{ response: GenerationResult; citations: Citation[] }> {
  const chatHistory = await MessageRepo.fetchHistory(chatId);
  const searchQuestion = await rewriteStandalone(chatHistory, question);
  const queryEmbedding = await embedQuery(searchQuestion);
  const candidatesChunks = await vectorSearch(queryEmbedding, tenantId);
  const rerankedChunks = await rerankVectors(searchQuestion, candidatesChunks);
  const response = await generateResponse(
    question,
    rerankedChunks,
    chatHistory,
  );
  const citations = parseCitations(response.rawCitations, rerankedChunks);
  return { response, citations };
}
