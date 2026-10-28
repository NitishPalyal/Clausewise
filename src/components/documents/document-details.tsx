"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import type { DocumentType } from "@/generated/prisma/enums";
import type { APIResponse } from "@/shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  VENDOR_CERTIFICATE: "Vendor certificate",
  AUDIT_REPORT: "Audit report",
  COMPLIANCE_CHECKLIST: "Compliance checklist",
};

type DocumentDetailData = {
  id: string;
  title: string;
  type: DocumentType;
  versions: {
    id: string;
    versionNumber: number;
    uploadedAt: string;
    isCurrent: boolean;
  }[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function DocumentDetails({
  tenantId,
  document,
  isManager,
}: {
  tenantId: string;
  document: DocumentDetailData;
  isManager: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete "${document.title}" and all of its versions? This cannot be undone.`,
      )
    ) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);
    const formData = new FormData();
    formData.set("tenantId", tenantId);
    formData.set("documentId", document.id);
    try {
      const response = await fetch("/api/documents/delete", {
        method: "DELETE",
        body: formData,
      });
      const result: APIResponse = await response.json();
      if (!response.ok || !result.success) {
        router.refresh();
        throw new Error(result.message || "The document could not be deleted.");
      }
      router.push("/documents");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The document could not be deleted. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <Link
        href="/documents"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to documents
      </Link>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <FileText className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
                  {document.title}
                </h1>
                <Badge variant="secondary">
                  {DOCUMENT_TYPE_LABELS[document.type]}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                First uploaded{" "}
                {document.versions.length
                  ? formatDate(
                      document.versions.reduce((first, version) =>
                        version.versionNumber < first.versionNumber
                          ? version
                          : first,
                      ).uploadedAt,
                    )
                  : "Not available"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DocumentUploadDialog
              tenantId={tenantId}
              documentId={document.id}
              mode="version"
            />
            {isManager && (
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                {isDeleting ? "Deleting..." : "Delete document"}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Version history</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every uploaded version is recorded here.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {document.versions.length}{" "}
            {document.versions.length === 1 ? "version" : "versions"}
          </span>
        </div>

        {document.versions.length ? (
          <ol className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {document.versions.map((version) => (
              <li
                key={version.id}
                className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                    v{version.versionNumber}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      Version {version.versionNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Uploaded {formatDate(version.uploadedAt)}
                    </p>
                  </div>
                </div>
                {version.isCurrent && (
                  <Badge
                    variant="outline"
                    className="w-fit border-verified/40 text-verified"
                  >
                    Current version
                  </Badge>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            No versions are available for this document yet.
          </p>
        )}
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
      </section>
    </div>
  );
}
