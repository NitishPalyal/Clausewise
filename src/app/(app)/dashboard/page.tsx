"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChatMessageItem } from "@/components/dashboard/chat-message";
import { ChatInput } from "@/components/dashboard/chat-input";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/types/chat-types";
import type { APIResponse } from "@/shared/types";

// Simple ID generator — not crypto, just for UI keys
let _msgCounter = 10;
function newId() {
  return `msg-${++_msgCounter}`;
}

export default function DashboardPage() {
  const { orgId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const query = inputValue.trim();
    if (!query || isLoading) return;
    if (!orgId) {
      setError("Select an organization before sending a question.");
      return;
    }
    setError(null);

    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

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

    try {
      const formData = new FormData();
      formData.set("message", query);
      formData.set("tenantId", orgId);
      if (chatId) formData.set("existingChatId", chatId);

      const response = await fetch("/api/chat/sendMessage", {
        method: "POST",
        body: formData,
      });
      const result: APIResponse<{
        chatId: string;
        response: string;
        citations: NonNullable<ChatMessage["citations"]>;
      }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send your question.");
      }

      setChatId(result.data.chatId);
      setMessages((previous) =>
        previous.map((message) =>
          message.id === loadingId
            ? {
                ...message,
                content: result.data.response,
                citations: result.data.citations,
                timestamp: new Date(),
                isLoading: false,
              }
            : message,
        ),
      );
      window.dispatchEvent(new Event("clausewise:chats-updated"));
    } catch (sendError) {
      setMessages((previous) =>
        previous.filter((message) => message.id !== loadingId),
      );
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send your question. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
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
          <EmptyState />
        </div>
      )}

      {error && (
        <p className="px-4 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
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
