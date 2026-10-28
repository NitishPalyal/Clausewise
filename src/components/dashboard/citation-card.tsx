"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Citation } from "@/types/chat-types";

interface CitationCardProps {
  citation: Citation;
  index: number;
}

function getPageLabel(citation: Citation) {
  const { pageStart, pageEnd } = citation;
  if (pageStart === null && pageEnd === null) return "Page not specified";
  if (pageStart === null) return `Through page ${pageEnd}`;
  if (pageEnd === null || pageStart === pageEnd) return `Page ${pageStart}`;
  return `Pages ${pageStart}–${pageEnd}`;
}

export function CitationCard({ citation, index }: CitationCardProps) {
  return (
    <Card
      className="w-full border border-border bg-card"
      role="region"
      aria-label={`Source ${index}: ${citation.documentTitle}`}
    >
      <CardContent className="flex items-start gap-3 p-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Source {index}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Version {citation.versionNumber}
            </span>
          </div>
          <p className="truncate text-sm font-medium leading-snug text-foreground">
            {citation.documentTitle}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {citation.sectionPath} · {getPageLabel(citation)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
