import { describe, it, expect, vi } from "vitest";
import {
  normalize,
  batchOf,
  embedBatchWithRetry,
  embedChunks,
} from "../ingestionPipeline/embedding/embedding.ts";
import type { Chunk } from "../ingestionPipeline/chunking/chunking.types.ts";

function makeChunk(overrides: Partial<Chunk> = {}): Chunk {
  return {
    sectionPath: "1 Purpose",
    sectionLevel: 1,
    chunkIndex: 0,
    pageStart: 1,
    pageEnd: 1,
    text: "Inspect material before it is accepted.",
    ...overrides,
  };
}

describe("normalize", () => {
  it("rescales a vector to length 1 without changing its direction", () => {
    const result = normalize([3, 4]);
    expect(result).toEqual([0.6, 0.8]);
    expect(Math.sqrt(result[0]! ** 2 + result[1]! ** 2)).toBeCloseTo(1);
  });

  it("leaves an all-zero vector unchanged, instead of dividing by zero", () => {
    expect(normalize([0, 0, 0])).toEqual([0, 0, 0]);
  });
});

describe("batchOf", () => {
  it("splits evenly when the size divides the array exactly", () => {
    expect(batchOf([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("puts the remainder in a smaller final group, without padding or erroring", () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);
    expect(batchOf(items, 20).map((b) => b.length)).toEqual([20, 5]);
  });
});

describe("embedBatchWithRetry", () => {
  it("returns the result as soon as a retry succeeds", async () => {
    let attempts = 0;
    const flaky = vi.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error(`simulated failure ${attempts}`);
      return [[1, 0, 0]];
    });
    const result = await embedBatchWithRetry(["text"], flaky);
    expect(result).toEqual([[1, 0, 0]]);
    expect(attempts).toBe(3);
  });

  it("throws the last error once every attempt has failed", async () => {
    const alwaysFails = vi.fn(async () => {
      throw new Error("permanent failure");
    });
    await expect(embedBatchWithRetry(["text"], alwaysFails)).rejects.toThrow(
      "permanent failure",
    );
    expect(alwaysFails).toHaveBeenCalledTimes(3);
  });
});

describe("embedChunks", () => {
  it("pairs every chunk with its own embedding, correctly, across multiple batches", async () => {
    const chunks = Array.from({ length: 45 }, (_, i) =>
      makeChunk({ text: `chunk text number ${i}` }),
    );
    let batchCallCount = 0;
    const fakeEmbed = vi.fn(async (texts: string[]) => {
      batchCallCount++;
      return texts.map((t) => [t.length, 0, 0]);
    });
    const result = await embedChunks(chunks, fakeEmbed);
    expect(result).toHaveLength(45);
    expect(batchCallCount).toBe(3);
    expect(result.every((r) => r.embedding[0] === r.text.length)).toBe(true);
  });
});
