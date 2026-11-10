import { describe, it, expect, vi } from "vitest";
import { rewriteStandalone } from "@/retrievalPipeline/rewrite/rewrite.ts";
import type { ChatTurn } from "@/retrievalPipeline/generation/generation.types.ts";

const history: ChatTurn[] = [
  { role: "user", content: "What torque should I use for M8 bolts?" },
  {
    role: "ai",
    content: "Torque M8 bolts to 24 Nm using a calibrated wrench [1].",
  },
];

describe("rewriteStandalone", () => {
  it("skips the AI call entirely when there is no history yet", async () => {
    const rewriteFn = vi.fn();
    const result = await rewriteStandalone(
      [],
      "What torque for M8 bolts?",
      rewriteFn,
    );
    expect(result).toBe("What torque for M8 bolts?");
    expect(rewriteFn).not.toHaveBeenCalled();
  });

  it("returns the rewritten standalone question when history exists", async () => {
    const result = await rewriteStandalone(
      history,
      "What about M10?",
      async () => "What torque should I use for M10 bolts?",
    );
    expect(result).toBe("What torque should I use for M10 bolts?");
  });

  it("falls back to the original message if the rewrite call throws", async () => {
    const result = await rewriteStandalone(
      history,
      "What about M10?",
      async () => {
        throw new Error("rate limited");
      },
    );
    expect(result).toBe("What about M10?");
  });

  it("falls back to the original message if the rewrite call returns only whitespace", async () => {
    expect(
      await rewriteStandalone(history, "What about M10?", async () => "   "),
    ).toBe("What about M10?");
  });
});
