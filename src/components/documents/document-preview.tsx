"use client";

import { useEffect, useState } from "react";
import { Download, Eye, FileText, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  getDocxPreviewText,
} from "@/lib/document-view.api";
import type { DocumentPreviewVersion } from "@/types/document-types";

export function DocumentPreview({
  documentId,
  documentTitle,
  versions,
}: {
  documentId: string;
  documentTitle: string;
  versions: DocumentPreviewVersion[];
}) {
  const initialVersion =
    versions.find((version) => version.isCurrent) ?? versions[0] ?? null;
  const [selectedVersionId, setSelectedVersionId] = useState(
    initialVersion?.id ?? "",
  );
  const [previewText, setPreviewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const selectedVersion =
    versions.find((version) => version.id === selectedVersionId) ?? initialVersion;

  useEffect(() => {
    if (!selectedVersion || selectedVersion.fileType !== "docx") {
      setPreviewText("");
      setErrorMessage("");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setPreviewText("");
    setErrorMessage("");
    setIsLoading(true);

    getDocxPreviewText(documentId, selectedVersion.id, controller.signal)
      .then(setPreviewText)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The document preview could not be loaded.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [documentId, selectedVersion?.fileType, selectedVersion?.id, retryCount]);

  if (!selectedVersion) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No document version is available to preview.
      </section>
    );
  }

  const previewUrl = getDocumentPreviewUrl(documentId, selectedVersion.id);
  const downloadUrl = getDocumentDownloadUrl(documentId, selectedVersion.id);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Eye className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Document preview</h2>
            <p className="truncate text-xs text-muted-foreground">
              {documentTitle} · Version {selectedVersion.versionNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {versions.length > 1 && (
            <label className="sr-only" htmlFor="document-preview-version">
              Choose a version to preview
            </label>
          )}
          {versions.length > 1 && (
            <select
              id="document-preview-version"
              value={selectedVersion.id}
              onChange={(event) => setSelectedVersionId(event.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            >
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  Version {version.versionNumber}
                  {version.isCurrent ? " (current)" : ""}
                </option>
              ))}
            </select>
          )}
          {selectedVersion.fileType && (
            <a
              href={downloadUrl}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-2",
              })}
            >
              <Download className="size-4" aria-hidden="true" />
              Download
            </a>
          )}
        </div>
      </div>

      {selectedVersion.fileType === "pdf" ? (
        <iframe
          key={selectedVersion.id}
          title={`${documentTitle}, version ${selectedVersion.versionNumber}`}
          src={previewUrl}
          className="h-[70vh] min-h-[28rem] w-full bg-muted/20"
        />
      ) : selectedVersion.fileType === "docx" ? (
        <div className="min-h-[28rem] p-4 sm:p-6">
          {isLoading ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading document text…
            </p>
          ) : errorMessage ? (
            <div className="flex flex-col items-start gap-3">
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : previewText.trim() ? (
            <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-7 text-foreground">
              {previewText}
            </pre>
          ) : (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileText className="size-4" aria-hidden="true" />
              This document does not contain readable text.
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[28rem] flex-col items-center justify-center gap-3 p-6 text-center">
          <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Preview is unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Download this file to view it on your device.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
