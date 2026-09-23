"use client";

/**
 * citation-card.tsx
 * The centrepiece of the ClauseWise promise:
 * "Ask a question, get the exact clause — not a guess."
 *
 * Renders a source citation with: document name, section, page,
 * matched clause text, match confidence, and expiry badge for certs.
 */

import { useState } from "react";
import {
  FileText,
  FileCheck,
  ClipboardList,
  BadgeAlert,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Citation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CitationCardProps {
  citation: Citation;
  index: number; // 1-based position for "Source 1", "Source 2" etc.
}

function DocumentTypeIcon({
  type,
  className,
}: {
  type: Citation["documentType"];
  className?: string;
}) {
  switch (type) {
    case "VENDOR_CERTIFICATE":
      return <FileCheck className={className} aria-hidden="true" />;
    case "AUDIT_REPORT":
      return <ClipboardList className={className} aria-hidden="true" />;
    case "COMPLIANCE_CHECKLIST":
      return <FileText className={className} aria-hidden="true" />;
  }
}

function DocumentTypeBadge({ type }: { type: Citation["documentType"] }) {
  const labels: Record<Citation["documentType"], string> = {
    VENDOR_CERTIFICATE: "Vendor Certificate",
    AUDIT_REPORT: "Audit Report",
    COMPLIANCE_CHECKLIST: "Compliance Checklist",
  };
  const colors: Record<Citation["documentType"], string> = {
    VENDOR_CERTIFICATE: "bg-blue-50 text-blue-700 border-blue-200",
    AUDIT_REPORT: "bg-orange-50 text-orange-700 border-orange-200",
    COMPLIANCE_CHECKLIST: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium py-0 px-1.5", colors[type])}
    >
      {labels[type]}
    </Badge>
  );
}

function isCertExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

export function CitationCard({ citation, index }: CitationCardProps) {
  const [expanded, setExpanded] = useState(true);
  const expired = isCertExpired(citation.expiryDate);

  return (
    <Card
      className={cn(
        "w-full border overflow-hidden transition-all duration-200",
        expired ? "border-red-200 bg-red-50/40" : "border-border bg-card",
      )}
      role="region"
      aria-label={`Source ${index}: ${citation.documentName}`}
    >
      <CardContent className="p-0">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 p-3">
          {/* Icon */}
          <div
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              expired
                ? "bg-red-100 text-red-600"
                : "bg-primary/10 text-primary",
            )}
          >
            {expired ? (
              <BadgeAlert className="h-4 w-4" aria-hidden="true" />
            ) : (
              <DocumentTypeIcon
                type={citation.documentType}
                className="h-4 w-4"
              />
            )}
          </div>

          {/* Title & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Source {index}
              </span>
              <DocumentTypeBadge type={citation.documentType} />
              {expired && (
                <Badge
                  variant="destructive"
                  className="text-[10px] py-0 px-1.5"
                >
                  Expired
                </Badge>
              )}
              {citation.expiryDate && !expired && (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 px-1.5 bg-green-50 text-green-700 border-green-200"
                >
                  Valid
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-foreground leading-snug truncate">
              {citation.documentName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {citation.section} · Page {citation.pageNumber}
            </p>
          </div>

          {/* Match confidence + expand/collapse */}
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="flex flex-col items-center cursor-default"
                  aria-label={`Match confidence: ${citation.matchScore}%`}
                >
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      citation.matchScore >= 90
                        ? "text-green-600"
                        : citation.matchScore >= 70
                          ? "text-amber-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {citation.matchScore}%
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-none">
                    match
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[180px] text-xs">
                How closely this section matched your question. Scores above 90%
                are highly reliable.
              </TooltipContent>
            </Tooltip>

            <Button
              id={`citation-toggle-${citation.id}`}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse citation" : "Expand citation"}
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* ── Clause text (collapsible) ──────────────────────────────────── */}
        {expanded && (
          <div className="px-3 pb-3">
            {/* Expiry notice for vendor certs */}
            {citation.expiryDate && (
              <div
                className={cn(
                  "mb-2 rounded-md px-2.5 py-1.5 text-xs flex items-center gap-1.5",
                  expired
                    ? "bg-red-100 text-red-700"
                    : "bg-green-50 text-green-700",
                )}
                role="alert"
              >
                <BadgeAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
                {expired
                  ? `Expired on ${new Date(citation.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. Request a renewed certificate before placing new orders.`
                  : `Valid until ${new Date(citation.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`}
              </div>
            )}

            {/* The matched clause text — this is the product promise */}
            <blockquote
              className="citation-highlight text-sm leading-relaxed"
              aria-label="Matched clause text"
            >
              {citation.clauseText}
            </blockquote>

            {/* View document link — placeholder */}
            <div className="mt-2 flex justify-end">
              <Button
                id={`view-doc-${citation.id}`}
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground gap-1.5 hover:text-primary"
                onClick={() => {
                  /* TODO: navigate to /documents/<documentId>#page=<pageNumber>
                   * when Document viewer is implemented */
                }}
                aria-label={`Open ${citation.documentName} at page ${citation.pageNumber}`}
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Open document · Page {citation.pageNumber}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
