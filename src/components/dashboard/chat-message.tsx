"use client";

/**
 * chat-message.tsx
 * Renders a single message in the conversation (user or assistant).
 * The assistant message includes citations via <CitationCard />.
 */

import { User, Sparkles, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CitationCard } from "@/components/dashboard/citation-card";
import type { ChatMessage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessage;
}

function MessageSkeleton() {
  return (
    <div
      className="flex gap-3 max-w-3xl"
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
        {/* Citation skeleton */}
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-20 w-full rounded-lg" />
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
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      aria-label={isUser ? "Your question" : "ClauseWise answer"}
    >
      {/* ── Avatar ────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
          isUser ? "bg-muted text-muted-foreground" : "text-white",
        )}
        style={!isUser ? { background: "var(--brand-navy)" } : undefined}
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
          "flex flex-col max-w-[80%] sm:max-w-[72%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Role label */}
        <span className="text-[10px] font-medium text-muted-foreground mb-1 px-1 uppercase tracking-wider">
          {isUser ? "You" : "ClauseWise"}
        </span>

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
            isUser
              ? "rounded-tr-sm text-foreground border border-border bg-muted/60"
              : "rounded-tl-sm bg-card text-foreground border border-border",
          )}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <time
          className="text-[10px] text-muted-foreground mt-1 px-1"
          dateTime={message.timestamp.toISOString()}
          aria-label={`Sent at ${message.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
        >
          {message.timestamp.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>

        {/* ── Citations (assistant only) ─────────────────────────────────── */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div
            className="mt-3 w-full space-y-2"
            aria-label={`${message.citations.length} source${message.citations.length > 1 ? "s" : ""} found`}
          >
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {message.citations.length === 1
                ? "1 source found"
                : `${message.citations.length} sources found`}
            </p>
            {message.citations.map((citation, i) => (
              <CitationCard
                key={citation.id}
                citation={citation}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
