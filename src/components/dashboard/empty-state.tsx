"use client";

/**
 * empty-state.tsx
 * Shown when the user has no conversation yet.
 * Three example questions let the user understand the product
 * with one click — no typing required to try it.
 */

import {
  FileSearch,
  BadgeCheck,
  ClipboardList,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EXAMPLE_QUESTIONS } from "@/lib/mock-data";

const ICON_MAP = {
  FileSearch,
  BadgeCheck,
  ClipboardList,
  CheckSquare,
} as const;

interface EmptyStateProps {
  onSelectQuestion: (question: string) => void;
}

export function EmptyState({ onSelectQuestion }: EmptyStateProps) {
  return (
    <section
      className="flex flex-col items-center justify-center h-full px-4 py-12 text-center"
      aria-label="Get started"
    >
      {/* Hero icon */}
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-md"
        style={{ background: "var(--brand-navy)" }}
        aria-hidden="true"
      >
        <FileSearch className="h-8 w-8 text-white" />
      </div>

      {/* Heading */}
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Ask about your compliance documents
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        Search your SOPs, audit reports, compliance checklists, and vendor
        certificates. Get the exact clause — with the document, section, and
        page number.
      </p>

      {/* Example questions */}
      <div className="w-full max-w-xl space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Try one of these
        </p>
        {EXAMPLE_QUESTIONS.map((item) => {
          const Icon =
            ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? FileSearch;
          return (
            <Card
              key={item.id}
              className="w-full border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`Example question: ${item.question}`}
              onClick={() => onSelectQuestion(item.question)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectQuestion(item.question);
                }
              }}
            >
              <div className="flex items-start gap-3 p-3.5 text-left">
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-150"
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-foreground leading-snug">
                    {item.question}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Reassurance copy */}
      <p className="mt-8 text-xs text-muted-foreground max-w-xs leading-relaxed">
        Every answer cites the exact document and clause. Nothing is made up.
      </p>
    </section>
  );
}
