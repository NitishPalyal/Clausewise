"use client";

/**
 * chat-message.tsx
 * Renders a single message in the conversation (user or assistant).
 * The assistant message includes a citation list beneath the answer.
 */

import { User, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CitationList } from "@/components/dashboard/citation-list";
import { AssistantMessageContent } from "@/components/dashboard/assistant-message-content";
import type { ChatMessage } from "@/types/chat-types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessage;
}

function MessageSkeleton() {
  return (
    <div
      className="flex w-full gap-3"
      role="status"
      aria-label="Loading answer…"
    >
      {/* Avatar skeleton */}
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        {/* Citation list skeleton */}
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function ChatMessageItem({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Show skeleton while the assistant is "thinking"
  if (message.isLoading) {
    return <MessageSkeleton />;
  }

  return (
    <article
      className={cn(
        "flex w-full items-start gap-3",
        isUser && "flex-row-reverse",
      )}
      aria-label={isUser ? "Your question" : "ClauseWise answer"}
    >
      {/* ── Avatar ────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm",
          isUser ? "bg-muted text-muted-foreground" : "text-primary-foreground",
        )}
        style={!isUser ? { background: "var(--primary)" } : undefined}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex min-w-0 flex-col",
          isUser ? "w-fit max-w-[82%] items-end" : "flex-1 items-start",
        )}
      >
        {/* Role label */}
        <span className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {isUser ? "You" : "ClauseWise"}
        </span>

        {/* Message bubble */}
        <div
          className={cn(
            "w-full rounded-2xl border px-5 py-4 shadow-sm",
            isUser
              ? "rounded-tr-sm border-border bg-muted/60 text-sm leading-6 text-foreground"
              : "rounded-tl-sm border-border bg-card text-foreground",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <AssistantMessageContent
              content={message.content}
              citations={message.citations ?? []}
            />
          )}
        </div>

        {/* ── Citations (assistant only) ─────────────────────────────────── */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <CitationList citations={message.citations} />
        )}

        {/* Timestamp */}
        <time
          className="mt-1 px-1 text-[10px] text-muted-foreground"
          dateTime={message.timestamp.toISOString()}
          aria-label={`Sent at ${message.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
        >
          {message.timestamp.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </article>
  );
}
