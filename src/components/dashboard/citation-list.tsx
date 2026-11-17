import { BookOpen } from "lucide-react";
import type { Citation } from "@/types/chat-types";

interface CitationListProps {
  citations: Citation[];
}

function getPageLabel(citation: Citation) {
  const { pageStart, pageEnd } = citation;
  if (pageStart === null && pageEnd === null) return "Page not specified";
  if (pageStart === null) return `Through page ${pageEnd}`;
  if (pageEnd === null || pageStart === pageEnd) return `Page ${pageStart}`;
  return `Pages ${pageStart}–${pageEnd}`;
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <section className="mt-4 w-full" aria-label="Citations">
      <h3 className="flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <BookOpen className="size-3" aria-hidden="true" />
        Citations
      </h3>
      <ol className="mt-2 divide-y divide-border/70">
        {citations.map((citation) => (
          <li
            key={`${citation.marker}-${citation.documentTitle}-${citation.versionNumber}-${citation.sectionPath}`}
            className="flex items-start gap-3 py-3 first:pt-1 last:pb-0"
          >
            <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
              [{citation.marker}]
            </span>
            <div className="min-w-0 space-y-0.5 text-xs leading-5 text-muted-foreground">
              <p className="text-sm font-medium text-foreground">
                {citation.documentTitle}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Version {citation.versionNumber}
                </span>
              </p>
              <p>
                <span className="font-medium text-foreground/80">Section:</span>{" "}
                {citation.sectionPath || "Not specified"}
              </p>
              <p>
                <span className="font-medium text-foreground/80">
                  Location:
                </span>{" "}
                {getPageLabel(citation)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
