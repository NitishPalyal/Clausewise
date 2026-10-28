"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { ChatInput } from "@/components/dashboard/chat-input";
import { ChatMessageItem } from "@/components/dashboard/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/types/chat-types";
import type { APIResponse } from "@/shared/types";

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { orgId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMessages() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/chat/getMessages?chatId=${encodeURIComponent(chatId)}`,
          { signal: controller.signal },
        );
        const result: APIResponse<{
          messages: {
            id: string;
            role: string;
            content: string;
            timestamp: string;
          }[];
        }> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load this chat.");
        }

        setMessages(
          result.data.messages.map((message) => ({
            id: message.id,
            role: message.role === "user" ? "user" : "assistant",
            content: message.content,
            timestamp: new Date(message.timestamp),
          })),
        );
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this chat.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadMessages();
    return () => controller.abort();
  }, [chatId]);

  const handleSend = async () => {
    const query = inputValue.trim();
    if (!query || isSending) return;
    if (!orgId) {
      setError("Select an organization before sending a question.");
      return;
    }
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    const loadingMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((current) => [...current, userMessage, loadingMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.set("message", query);
      formData.set("existingChatId", chatId);
      formData.set("tenantId", orgId);

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

      setMessages((current) =>
        current.map((message) =>
          message.id === loadingMessage.id
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
      setMessages((current) =>
        current.filter((message) => message.id !== loadingMessage.id),
      );
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send your question. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
          {isLoading && (
            <p className="text-sm text-muted-foreground" role="status">
              Loading chat…
            </p>
          )}
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </ScrollArea>
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isLoading={isSending}
      />
    </div>
  );
}
