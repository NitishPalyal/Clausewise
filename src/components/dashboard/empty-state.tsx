"use client";

import { FileSearch } from "lucide-react";

export function EmptyState() {
  return (
    <section
      className="flex flex-col items-center justify-center h-full px-4 py-12 text-center"
      aria-label="Get started"
    >
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-md"
        style={{ background: "var(--primary)" }}
        aria-hidden="true"
      >
        <FileSearch className="h-8 w-8 text-primary-foreground" />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">
        Ask about your compliance documents
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        Search your SOPs, audit reports, compliance checklists, and vendor
        certificates. Get the exact clause — with the document, section, and
        page number.
      </p>

      <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
        Ask a question and we&apos;ll trace the answer back to the exact source.
      </p>
    </section>
  );
}
