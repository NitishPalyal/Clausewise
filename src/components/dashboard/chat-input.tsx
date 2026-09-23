"use client";

/**
 * chat-input.tsx
 * The sticky message input bar at the bottom of the dashboard.
 *
 * Features:
 * - Textarea that auto-grows (up to 5 lines) with the message
 * - Ctrl+Enter / Cmd+Enter keyboard shortcut to send
 * - Character limit (500) with counter
 * - Attach file button (placeholder — document upload is out of scope today)
 * - Disabled state while the assistant is loading
 */

import { useRef } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MAX_CHARS = 500;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = "Ask about a clause, vendor certificate, or audit finding…",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = value.trim().length > 0 && !isLoading && !isOverLimit;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter sends the message
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize textarea — grow up to ~5 lines, then scroll
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3">
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm transition-all duration-150",
          isOverLimit
            ? "border-destructive ring-1 ring-destructive/30"
            : "border-border focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20",
        )}
      >
        {/* Attach file — placeholder */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              id="attach-file-button"
              type="button"
              variant="ghost"
              size="icon"
              disabled={isLoading}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground mb-0.5"
              aria-label="Attach a document (coming soon)"
              onClick={() => {
                /* TODO: trigger document upload flow when implemented */
              }}
            >
              <Paperclip className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Attach a document (coming soon)
          </TooltipContent>
        </Tooltip>

        {/* Textarea */}
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Searching your documents…" : placeholder}
          disabled={isLoading}
          rows={1}
          aria-label="Your question"
          aria-describedby="chat-input-hint"
          className={cn(
            "flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground",
            "min-h-8 max-h-35 py-1.5 leading-relaxed",
            "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "overflow-y-auto",
          )}
          style={{ height: "32px" }}
        />

        {/* Send button */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              id="send-message-button"
              type="button"
              size="icon"
              disabled={!canSend}
              onClick={onSend}
              aria-label={
                isLoading ? "Searching…" : "Send question (Ctrl+Enter)"
              }
              className={cn(
                "h-8 w-8 shrink-0 mb-0.5 rounded-lg transition-all duration-150",
                canSend
                  ? "text-white shadow-sm hover:opacity-90"
                  : "bg-muted text-muted-foreground",
              )}
              style={canSend ? { background: "var(--brand-navy)" } : undefined}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {isLoading ? "Searching…" : "Send (Ctrl+Enter)"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Hint row: keyboard shortcut + char counter */}
      <div
        id="chat-input-hint"
        className="flex items-center justify-between mt-1.5 px-1"
      >
        <p className="text-[10px] text-muted-foreground">
          {isLoading
            ? "Searching your compliance documents…"
            : "Press Ctrl+Enter to send"}
        </p>
        <p
          className={cn(
            "text-[10px] tabular-nums",
            isOverLimit
              ? "text-destructive font-semibold"
              : charCount > MAX_CHARS * 0.85
                ? "text-amber-600"
                : "text-muted-foreground",
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {charCount}/{MAX_CHARS}
        </p>
      </div>
    </div>
  );
}
