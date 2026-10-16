import { embedQuery } from "./embedding/embedding";
import { generateResponse } from "./generation/generation";
import { GenerationResult } from "./generation/generation.types";
import { rerankVectors } from "./rerank/rerank";
import { vectorSearch } from "./vectorSearch/vectorSearch";

export async function retrievalPipeline(
  searchQuery: string,
  tenantId: string,
): Promise<{ response: GenerationResult; citations: string[] }> {
  const { query, embedding } = await embedQuery(searchQuery);
  const vectors = await vectorSearch(embedding, tenantId, 20);
  const rerankedVectors = await rerankVectors(query, vectors);
  const response = await generateResponse(query, rerankedVectors);
  const citations = await parseCitations(response);
  return { response, citations };
}
