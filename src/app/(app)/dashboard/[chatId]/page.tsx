"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { ChatInput } from "@/components/dashboard/chat-input";
import { ChatMessageItem } from "@/components/dashboard/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/types/chat-types";
import { useSocket } from "../../../../../socket/socketProvider";
import {
  fetchApiResponse,
  getUserFacingErrorMessage,
} from "@/lib/api-response";

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { orgId } = useAuth();
  const { socket } = useSocket();
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
        const result = await fetchApiResponse<{
          messages: {
            id: string;
            role: string;
            content: string;
            timestamp: string;
            citations?: NonNullable<ChatMessage["citations"]> | null;
          }[];
        }>(
          `/api/chat/getMessages?chatId=${encodeURIComponent(chatId)}`,
          { signal: controller.signal },
          "We couldn't load this conversation.",
        );

        setMessages(
          result.data.messages.map((message) => ({
            id: message.id,
            role: message.role === "user" ? "user" : "assistant",
            content: message.content,
            timestamp: new Date(message.timestamp),
            ...(message.citations?.length
              ? { citations: message.citations }
              : {}),
          })),
        );
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }
        setError(
          getUserFacingErrorMessage(
            loadError,
            "We couldn't load this conversation. Please try again.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadMessages();
    return () => controller.abort();
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    async function handleChatReplyReady(payload: { chatId?: unknown }) {
      // Ignore notifications belonging to other conversations.
      if (payload?.chatId !== chatId) return;

      try {
        const result = await fetchApiResponse<{
          messages: {
            id: string;
            role: string;
            content: string;
            timestamp: string;
            citations?: NonNullable<ChatMessage["citations"]> | null;
          }[];
        }>(
          `/api/chat/getMessages?chatId=${encodeURIComponent(chatId)}`,
          {},
          "We couldn't refresh this conversation.",
        );

        setMessages(
          result.data.messages.map((message) => ({
            id: message.id,
            role: message.role === "user" ? "user" : "assistant",
            content: message.content,
            timestamp: new Date(message.timestamp),
            ...(message.citations?.length
              ? { citations: message.citations }
              : {}),
          })),
        );
      } catch (error) {
        console.error("Failed to refresh chat messages:", error);
      }
    }

    socket.on("chat:reply-ready", handleChatReplyReady);

    return () => {
      socket.off("chat:reply-ready", handleChatReplyReady);
    };
  }, [socket, chatId]);

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

      const result = await fetchApiResponse<{
        chatId: string;
        response: string;
        citations: NonNullable<ChatMessage["citations"]>;
      }>(
        "/api/chat/sendMessage",
        { method: "POST", body: formData },
        "We couldn't send your question.",
      );

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
        getUserFacingErrorMessage(
          sendError,
          "We couldn't send your question. Please try again.",
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
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
        tenantId={orgId ?? null}
      />
    </div>
  );
}
