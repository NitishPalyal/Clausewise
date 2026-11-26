-- This is an empty migration.
CREATE INDEX IF NOT EXISTS "chunk_embedding_hnsw_idx"
ON "Chunk"
USING hnsw ("embedding" vector_cosine_ops);