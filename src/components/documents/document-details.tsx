"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";

import type { DocumentType } from "@/generated/prisma/enums";
import type { APIResponse } from "@/shared/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type IngestionStage =
  | "downloading"
  | "extracting"
  | "structuring"
  | "chunking"
  | "embedding"
  | "saving";

type IngestionProgress = {
  stage: IngestionStage;
  percentage: number;
  message: string;
};

type DocumentProgressEvent = DocumentJobEvent & {
  progress: unknown;
};

function isIngestionProgress(value: unknown): value is IngestionProgress {
  if (typeof value !== "object" || value === null) return false;

  const progress = value as Record<string, unknown>;

  return (
    [
      "downloading",
      "extracting",
      "structuring",
      "chunking",
      "embedding",
      "saving",
    ].includes(progress.stage as string) &&
    typeof progress.percentage === "number" &&
    Number.isFinite(progress.percentage) &&
    progress.percentage >= 0 &&
    progress.percentage <= 100 &&
    typeof progress.message === "string"
  );
}

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

  const [versionStatuses, setVersionStatuses] = useState<
    Partial<Record<string, DocumentVersionStatus>>
  >({});
  const [versionProgress, setVersionProgress] = useState<
    Partial<Record<string, IngestionProgress>>
  >({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const versions = document.versions.map((version) => ({
    ...version,
    status: versionStatuses[version.id] ?? version.status,
    progress: versionProgress[version.id],
  }));

  // Listen for document-processing events from the Socket.IO server.
  useEffect(() => {
    if (!socket) return;

    function updateVersionStatus(
      payload: DocumentJobEvent,
      status: DocumentVersionStatus,
    ) {
      if (typeof payload?.documentVersionId !== "string") return;

      setVersionStatuses((currentStatuses) => ({
        ...currentStatuses,
        [payload.documentVersionId]: status,
      }));
    }

    function clearVersionProgress(documentVersionId: string) {
      setVersionProgress((currentProgress) => {
        const updatedProgress = { ...currentProgress };
        delete updatedProgress[documentVersionId];
        return updatedProgress;
      });
    }

    const handleProcessing = (payload: DocumentJobEvent) => {
      if (typeof payload?.documentVersionId !== "string") return;

      clearVersionProgress(payload.documentVersionId);
      updateVersionStatus(payload, "uploading");
    };

    const handleProgress = (payload: DocumentProgressEvent) => {
      const documentVersionId = payload?.documentVersionId;
      const progress = payload?.progress;

      if (
        typeof documentVersionId !== "string" ||
        !isIngestionProgress(progress)
      ) {
        return;
      }

      setVersionStatuses((currentStatuses) => ({
        ...currentStatuses,
        [documentVersionId]: "uploading",
      }));

      setVersionProgress((currentProgress) => ({
        ...currentProgress,
        [documentVersionId]: progress,
      }));
    };

    const handleReady = (payload: DocumentJobEvent) => {
      if (typeof payload?.documentVersionId !== "string") return;

      clearVersionProgress(payload.documentVersionId);
      updateVersionStatus(payload, "uploaded");
    };

    const handleFailed = (payload: DocumentJobEvent) => {
      if (typeof payload?.documentVersionId !== "string") return;

      clearVersionProgress(payload.documentVersionId);
      updateVersionStatus(payload, "failed");
    };

    socket.on("document:processing", handleProcessing);
    socket.on("document:progress", handleProgress);
    socket.on("document:ready", handleReady);
    socket.on("document:failed", handleFailed);

    return () => {
      socket.off("document:processing", handleProcessing);
      socket.off("document:progress", handleProgress);
      socket.off("document:ready", handleReady);
      socket.off("document:failed", handleFailed);
    };
  }, [socket]);

  async function handleDelete() {
    setErrorMessage("");
    setIsDeleting(true);

    try {
      const response = await fetch("/api/documents/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, documentId: document.id }),
      });

      const result: APIResponse<{ documentId: string }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.details ||
            result.message ||
            `The document could not be deleted (HTTP ${response.status}).`,
        );
      }

      setIsDeleteDialogOpen(false);
      router.replace(
        result.warning
          ? "/documents?notice=storage-cleanup-failed"
          : "/documents",
      );
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
                onClick={() => {
                  setErrorMessage("");
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete document
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

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      Version {version.versionNumber}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Uploaded {formatDate(version.uploadedAt)}
                    </p>

                    {version.progress && (
                      <div className="mt-3 w-full max-w-sm space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{version.progress.message}</span>
                          <span className="shrink-0 tabular-nums">
                            {version.progress.percentage}%
                          </span>
                        </div>

                        <div
                          role="progressbar"
                          aria-label={`Processing version ${version.versionNumber}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={version.progress.percentage}
                          className="h-2 w-full overflow-hidden rounded-full bg-secondary"
                        >
                          <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{
                              width: `${version.progress.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
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

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open);
            if (!open) setErrorMessage("");
          }
        }}
      >
        <DialogContent
          showCloseButton={!isDeleting}
          aria-describedby="delete-document-description"
        >
          <DialogHeader>
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription id="delete-document-description">
              <span className="font-medium text-foreground">
                {document.title}
              </span>{" "}
              and all {versions.length === 1 ? "its version" : "its versions"}{" "}
              will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {isDeleting ? "Deleting document..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
