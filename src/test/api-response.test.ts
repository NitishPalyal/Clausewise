import { describe, expect, it } from "vitest";
import {
  getUserFacingErrorMessage,
  readApiResponse,
} from "@/lib/api-response";

describe("API response handling", () => {
  it("uses a friendly message for an empty server error response", async () => {
    await expect(
      readApiResponse(
        new Response("", { status: 500 }),
        "We couldn't send your question.",
      ),
    ).rejects.toThrow(
      "We couldn't send your question. A temporary service problem occurred. Please try again shortly.",
    );
  });

  it("maps API error codes without exposing server messages or details", async () => {
    const response = Response.json(
      {
        success: false,
        message: "PrismaClientInitializationError: database unreachable",
        data: null,
        error: {
          code: "UNAUTHORIZED",
          details: "internal stack trace",
        },
      },
      { status: 401 },
    );

    await expect(readApiResponse(response, "Request failed.")).rejects.toThrow(
      "Your session has expired. Sign in again and retry.",
    );
  });

  it("shows a clear message when the AI provider is temporarily unavailable", async () => {
    const response = Response.json(
      {
        success: false,
        message: "Internal provider error",
        data: null,
        error: { code: "AI_SERVICE_UNAVAILABLE" },
      },
      { status: 503 },
    );

    await expect(readApiResponse(response, "Request failed.")).rejects.toThrow(
      "Our AI service is busy right now. Please try again in a moment.",
    );
  });

  it("does not expose server exceptions from a JSON error response", async () => {
    const response = Response.json(
      {
        success: false,
        message: "PrismaClientInitializationError: database unreachable",
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          details: "internal stack trace",
        },
      },
      { status: 500 },
    );

    await expect(
      readApiResponse(response, "We couldn't send your question."),
    ).rejects.toThrow(
      "We couldn't send your question. A temporary service problem occurred. Please try again shortly.",
    );
  });

  it("does not display unexpected client-side exception messages", () => {
    expect(
      getUserFacingErrorMessage(
        new Error("JSON.parse: unexpected end of data"),
        "We couldn't load this chat.",
      ),
    ).toBe("We couldn't load this chat.");
  });
});
