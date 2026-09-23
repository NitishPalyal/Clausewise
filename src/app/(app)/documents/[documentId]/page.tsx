import type { Metadata } from "next";
import { FileText, ArrowLeft, Download, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Document View | ClauseWise",
  description: "View document details, indexed sections, and exact clauses.",
};

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Link
        href="/documents"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to documents
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--brand-navy)" }}
          >
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                Document Details ({documentId})
              </h1>
              <Badge variant="outline" className="text-green-600 border-green-600/30">
                Indexed
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              SOP-WEAVE-12 • Standard Operating Procedure • 42 pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Indexed Clauses Preview
        </h2>
        <p className="text-sm text-muted-foreground">
          Below are matched sections from this document used by the ClauseWise search engine during compliance queries.
        </p>
        <div className="rounded-lg border border-border p-4 bg-muted/30 text-sm space-y-2">
          <span className="font-semibold text-foreground">
            Section 4.2 — Personal Protective Equipment (PPE) Standards
          </span>
          <p className="text-muted-foreground leading-relaxed">
            &quot;All operators on the weaving floor must wear high-decibel ear protection (min NRR 25dB) and non-slip steel-toe boots during shift operation. Daily inspection of PPE is mandatory prior to machine power-on.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
