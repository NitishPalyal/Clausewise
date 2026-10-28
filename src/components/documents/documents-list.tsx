"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import type { DocumentType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  VENDOR_CERTIFICATE: "Vendor certificate",
  AUDIT_REPORT: "Audit report",
  COMPLIANCE_CHECKLIST: "Compliance checklist",
};

type DocumentListItem = {
  id: string;
  title: string;
  type: DocumentType;
  uploadedAt: string | null;
  versionCount: number;
};

function formatDate(date: string | null) {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function DocumentsList({
  tenantId,
  documents,
}: {
  tenantId: string;
  documents: DocumentListItem[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "ALL">("ALL");
  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return documents.filter((document) => {
      const matchesSearch =
        !normalizedSearch ||
        document.title.toLocaleLowerCase().includes(normalizedSearch);
      return (
        matchesSearch &&
        (typeFilter === "ALL" || document.type === typeFilter)
      );
    });
  }, [documents, search, typeFilter]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Your workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Documents
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Find, review, and maintain the documents shared with your tenant.
          </p>
        </div>
        <DocumentUploadDialog tenantId={tenantId} mode="new" />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents by name"
              aria-label="Search documents by name"
              className="h-10 bg-card pl-9"
            />
          </div>
          <select
            aria-label="Filter by document type"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as DocumentType | "ALL")
            }
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="ALL">All document types</option>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">All documents</h2>
          <span className="text-sm text-muted-foreground">
            {filteredDocuments.length}{" "}
            {filteredDocuments.length === 1 ? "document" : "documents"}
          </span>
        </div>

        {filteredDocuments.length ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <ul className="divide-y divide-border">
              {filteredDocuments.map((document) => (
                <li key={document.id}>
                  <Link
                    href={`/documents/${document.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 sm:px-5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <FileText className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {document.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">
                          {DOCUMENT_TYPE_LABELS[document.type]}
                        </Badge>
                        <span>Uploaded {formatDate(document.uploadedAt)}</span>
                        <span>
                          {document.versionCount}{" "}
                          {document.versionCount === 1 ? "version" : "versions"}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-medium text-primary">
                      View
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold">
              {documents.length ? "No matching documents" : "No documents yet"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {documents.length
                ? "Try changing your search or document type filter."
                : "Upload a document to make it available to everyone in your tenant."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
