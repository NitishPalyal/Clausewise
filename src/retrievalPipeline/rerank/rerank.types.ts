import type { RetrievedChunk } from "../vectorSearch/vectorSearch.types.ts";

export interface RankedChunk extends RetrievedChunk {
  rank: number;
}
