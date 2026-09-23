"use client";

import { useState } from "react";
import { ChatInput } from "@/components/dashboard/chat-input";
import { ChatMessageItem } from "@/components/dashboard/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EXAMPLE_CONVERSATION, type ChatMessage } from "@/lib/mock-data";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(
    EXAMPLE_CONVERSATION.slice(0, 2),
  );
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    const query = inputValue.trim();
    if (!query) return;
    // TODO(logic): replace this local preview with useChat() and POST /api/chat when chat persistence exists.
    setMessages((current) => [
      ...current,
      {
        id: `preview-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isLoading={false}
      />
    </div>
  );
}
