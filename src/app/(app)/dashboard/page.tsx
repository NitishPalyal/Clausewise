"use client";

/**
 * dashboard/page.tsx
 * The core ClauseWise experience: a chat interface where users
 * ask questions about their compliance documents and get answers
 * with exact citations.
 *
 * States:
 *   1. Empty — no conversation yet; shows <EmptyState /> with example questions
 *   2. Active — messages are in the list; shows scrollable chat + sticky input
 *
 * Data flow (placeholder):
 *   - User types a question and hits Send or Ctrl+Enter
 *   - A "loading" assistant message is optimistically added
 *   - TODO: replace simulateSearch() with a real API call to
 *     POST /api/search when the backend RAG pipeline is ready
 *   - The mock response (from EXAMPLE_CONVERSATION) is shown after delay
 */

import { useState, useRef, useEffect } from "react";
import { ChatMessageItem } from "@/components/dashboard/chat-message";
import { ChatInput } from "@/components/dashboard/chat-input";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EXAMPLE_CONVERSATION, type ChatMessage } from "@/lib/mock-data";

// Simple ID generator — not crypto, just for UI keys
let _msgCounter = 10;
function newId() {
  return `msg-${++_msgCounter}`;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleSend = async () => {
    const query = inputValue.trim();
    if (!query || isLoading) return;

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    // Add a loading placeholder for the assistant
    const loadingId = newId();
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInputValue("");
    setIsLoading(true);

    /*
     * ── PLACEHOLDER — replace with real API call ────────────────────────
     * When the backend is ready:
     *
     *   const res = await fetch("/api/search", {
     *     method: "POST",
     *     headers: { "Content-Type": "application/json" },
     *     body: JSON.stringify({ query, orgId: currentOrg.id }),
     *   });
     *   const data = await res.json();
     *   // data: { answer: string; citations: Citation[] }
     *
     * Replace the mock below with: answer = data.answer; citations = data.citations;
     * ─────────────────────────────────────────────────────────────────────
     */
    await simulateSearch();

    // Pick a mock response — cycle through examples based on message count
    const exampleIndex =
      (messages.length / 2) % (EXAMPLE_CONVERSATION.length / 2);
    const mockResponse =
      EXAMPLE_CONVERSATION[Math.floor(exampleIndex) * 2 + 1] ??
      EXAMPLE_CONVERSATION[1]!;

    // Replace loading placeholder with real (mock) response
    setMessages((prev) =>
      prev.map((m) =>
        m.id === loadingId
          ? {
              ...mockResponse,
              id: loadingId,
              timestamp: new Date(),
              isLoading: false,
            }
          : m,
      ),
    );
    setIsLoading(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* ── Chat area ─────────────────────────────────────────────────────── */}
      {hasMessages ? (
        <ScrollArea className="flex-1 chat-scroll">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <ChatMessageItem key={message.id} message={message} />
            ))}
            {/* Scroll anchor */}
            <div ref={bottomRef} aria-hidden="true" />
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <EmptyState onSelectQuestion={handleSelectQuestion} />
        </div>
      )}

      {/* ── Sticky input bar ──────────────────────────────────────────────── */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}

/** Simulates network latency for the mock search. Remove when real API is wired. */
function simulateSearch(): Promise<void> {
  const delay = 1200 + Math.random() * 800; // 1.2–2s
  return new Promise((resolve) => setTimeout(resolve, delay));
}
