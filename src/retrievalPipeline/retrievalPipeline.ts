import { parseCitations } from "./citations/citations";
import { Citation } from "./citations/citations.types";
import { embedQuery } from "./embedding/embedding";
import { generateResponse } from "./generation/generation";
import { GenerationResult } from "./generation/generation.types";
import { rerankVectors } from "./rerank/rerank";
import { vectorSearch } from "./vectorSearch/vectorSearch";
import * as MessageRepo from "@/repository/messages/messages.repostory";

export async function retrievalPipeline(
  searchQuery: string,
  tenantId: string,
  chatId: string,
): Promise<{ response: GenerationResult; citations: Citation[] }> {
  const { query, embedding } = await embedQuery(searchQuery);
  const vectors = await vectorSearch(embedding, tenantId, 20);
  const rerankedChunks = await rerankVectors(query, vectors);
  const chatHistory = await MessageRepo.fetchHistory(chatId);
  const response = await generateResponse(query, rerankedChunks, chatHistory);
  const citations = parseCitations(response.rawCitations, rerankedChunks);
  return { response, citations };
}
