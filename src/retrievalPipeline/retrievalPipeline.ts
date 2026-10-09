// export async function retrievalPipeline(
//   search: string,
//   tenantId: string,
// ): Promise<{ response: string; citations: string[] }> {
//   const embedding = await embedding(search);
//   const vectors = await chunk.vectorSreach(embedding, 20);
//   const reranked = await rerank(vectors);
//   const prompt = await generatePrompt(reranked);
//   const response = await generateResponse(prompt);
//   const citations = await parseCitations(response);
//   return { response, citations };
// }
