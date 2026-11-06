"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";

import type { DocumentType } from "@/generated/prisma/enums";
import type { APIResponse } from "@/shared/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocumentUpload } from "@/components/documents/document-upload-provider";
import { useSocket } from "@/lib/socket/useSocket.ts";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  VENDOR_CERTIFICATE: "Vendor certificate",
  AUDIT_REPORT: "Audit report",
  COMPLIANCE_CHECKLIST: "Compliance checklist",
};

type DocumentVersionStatus =
  "pending" | "uploading" | "uploaded" | "failed" | "delayed";

type DocumentVersion = {
  id: string;
  versionNumber: number;
  uploadedAt: string;
  isCurrent: boolean;
  status: DocumentVersionStatus;
};

type DocumentDetailData = {
  id: string;
  title: string;
  type: DocumentType;
  versions: DocumentVersion[];
};

type DocumentJobEvent = {
  documentVersionId: string;
};

const DOCUMENT_STATUS_LABELS: Record<DocumentVersionStatus, string> = {
  pending: "Queued",
  uploading: "Processing",
  uploaded: "Ready",
  failed: "Failed",
  delayed: "Delayed",
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
  const socket = useSocket();
  const openDocumentUpload = useDocumentUpload();

  const [versions, setVersions] = useState(document.versions);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Synchronize versions when the server sends updated document data.
  useEffect(() => {
    setVersions(document.versions);
  }, [document.versions]);

  // Listen for document-processing events from the Socket.IO server.
  useEffect(() => {
    if (!socket) return;

    function updateVersionStatus(
      payload: DocumentJobEvent,
      status: DocumentVersionStatus,
    ) {
      if (typeof payload?.documentVersionId !== "string") return;

      setVersions((currentVersions) =>
        currentVersions.map((version) =>
          version.id === payload.documentVersionId
            ? { ...version, status }
            : version,
        ),
      );
    }

    const handleProcessing = (payload: DocumentJobEvent) => {
      updateVersionStatus(payload, "uploading");
    };

    const handleReady = (payload: DocumentJobEvent) => {
      updateVersionStatus(payload, "uploaded");
    };

    const handleFailed = (payload: DocumentJobEvent) => {
      updateVersionStatus(payload, "failed");
    };

    socket.on("document:processing", handleProcessing);
    socket.on("document:ready", handleReady);
    socket.on("document:failed", handleFailed);

    // Remove these exact listeners when the component unmounts.
    return () => {
      socket.off("document:processing", handleProcessing);
      socket.off("document:ready", handleReady);
      socket.off("document:failed", handleFailed);
    };
  }, [socket]);

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
                {versions.length
                  ? formatDate(
                      versions.reduce((first, version) =>
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
            <Button
              type="button"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() =>
                openDocumentUpload({
                  tenantId,
                  documentId: document.id,
                })
              }
            >
              <Plus className="size-4" aria-hidden="true" />
              Upload new version
            </Button>

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
            {versions.length} {versions.length === 1 ? "version" : "versions"}
          </span>
        </div>

        {versions.length ? (
          <ol className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {versions.map((version) => (
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

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {DOCUMENT_STATUS_LABELS[version.status]}
                  </Badge>

                  {version.isCurrent && (
                    <Badge
                      variant="outline"
                      className="w-fit border-verified/40 text-verified"
                    >
                      Current version
                    </Badge>
                  )}
                </div>
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
