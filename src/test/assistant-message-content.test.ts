import { describe, expect, it } from "vitest";
import { parseAssistantMessage } from "@/components/dashboard/assistant-message-content";

describe("parseAssistantMessage", () => {
  it("formats inline numbered sections as a list after the introduction", () => {
    expect(
      parseAssistantMessage(
        "Driver responsibilities include: 1. Policy compliance: Follow the SOP [0]. 2. Safe driving: Take rest breaks [1].",
      ),
    ).toEqual([
      {
        type: "paragraph",
        content: "Driver responsibilities include:",
      },
      {
        type: "ordered-list",
        items: [
          "Policy compliance: Follow the SOP [0].",
          "Safe driving: Take rest breaks [1].",
        ],
      },
    ]);
  });

  it("preserves prose that is not a sequential numbered list", () => {
    expect(
      parseAssistantMessage("Use version 2.5 for this procedure."),
    ).toEqual([
      {
        type: "paragraph",
        content: "Use version 2.5 for this procedure.",
      },
    ]);
  });
});
