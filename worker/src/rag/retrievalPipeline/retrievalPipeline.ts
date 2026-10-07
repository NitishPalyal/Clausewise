export async function retrievalPipeline(search: string): Promise<string> {
  const embedding = await embedding(search);
  const vectors = await chunk.vectorSeacrh(embedding, 20);
  const reranked = await rerank(vectors);
  const prompt = await generatePrompt(reranked);
  const response = await generateResponse(prompt);
  return response;
}
