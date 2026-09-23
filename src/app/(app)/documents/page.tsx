import type { Metadata } from "next";
import { FileText, Upload, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Documents | ClauseWise",
  description: "Manage and upload your manufacturing compliance documents, SOPs, and certificates.",
};

const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    title: "SOP-WEAVE-12: Loom Safety & Maintenance",
    category: "Standard Operating Procedure",
    pages: 42,
    uploadedAt: "2026-09-15",
    status: "Indexed",
    clauses: 128,
  },
  {
    id: "doc-2",
    title: "Q3 2023 ISO-9001 Internal Audit Report",
    category: "Audit Report",
    pages: 18,
    uploadedAt: "2026-09-10",
    status: "Indexed",
    clauses: 45,
  },
  {
    id: "doc-3",
    title: "Ramsons Fabrics Vendor Quality Certificate",
    category: "Vendor Certificate",
    pages: 4,
    uploadedAt: "2026-08-28",
    status: "Indexed",
    clauses: 12,
  },
  {
    id: "doc-4",
    title: "Fire Safety & Emergency Checklist (Spinning)",
    category: "Checklist",
    pages: 8,
    uploadedAt: "2026-08-14",
    status: "Indexed",
    clauses: 24,
  },
];

export default function DocumentsPage() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Compliance Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All indexed SOPs, audit reports, checklists, and supplier certificates for your plant.
          </p>
        </div>
        <Button className="bg-[var(--brand-navy)] text-white gap-2 shrink-0">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload Document
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search document name, category, or tag..."
            className="pl-9 bg-background"
          />
        </div>
        <Button variant="outline" className="gap-2 shrink-0 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Documents List */}
      <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden shadow-sm">
        {MOCK_DOCUMENTS.map((doc) => (
          <div
            key={doc.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mt-0.5"
                style={{ background: "var(--brand-navy)" }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {doc.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="font-normal">
                    {doc.category}
                  </Badge>
                  <span>•</span>
                  <span>{doc.pages} pages</span>
                  <span>•</span>
                  <span>{doc.clauses} clauses indexed</span>
                  <span>•</span>
                  <span>Uploaded {doc.uploadedAt}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center shrink-0">
              <Badge
                variant="outline"
                className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-950/20"
              >
                {doc.status}
              </Badge>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
