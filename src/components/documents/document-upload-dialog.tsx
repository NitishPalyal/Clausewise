"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import type { DocumentType } from "@/generated/prisma/enums";
import type { APIResponse } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "VENDOR_CERTIFICATE", label: "Vendor certificate" },
  { value: "AUDIT_REPORT", label: "Audit report" },
  { value: "COMPLIANCE_CHECKLIST", label: "Compliance checklist" },
];

export function DocumentUploadDialog({
  tenantId,
  documentId,
  mode,
}: {
  tenantId: string;
  documentId?: string;
  mode: "new" | "version";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isNewDocument = mode === "new";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setErrorMessage("Choose a PDF or DOCX file to continue.");
      return;
    }
    if (
      isNewDocument &&
      !String(formData.get("title") ?? "").trim()
    ) {
      setErrorMessage("Enter a name for this document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("The selected file must be 10 MB or smaller.");
      return;
    }

    formData.set("tenantId", tenantId);
    if (isNewDocument) {
      formData.set("title", String(formData.get("title") ?? "").trim());
      formData.set("type", String(formData.get("type") ?? ""));
    } else if (documentId) {
      formData.set("documentId", documentId);
    } else {
      setErrorMessage("Document details are missing. Reload and try again.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(
        isNewDocument
          ? "/api/documents/uploadNew"
          : "/api/documents/uploadNewVersion",
        { method: "POST", body: formData },
      );
      const result: APIResponse = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "The upload could not be completed.");
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The upload could not be completed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isUploading) {
          setOpen(nextOpen);
          if (nextOpen) setErrorMessage("");
        }
      }}
    >
      <Button
        type="button"
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setOpen(true)}
      >
        {isNewDocument ? (
          <Upload className="size-4" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {isNewDocument ? "Upload document" : "Upload new version"}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isNewDocument ? "Upload a document" : "Upload a new version"}
          </DialogTitle>
          <DialogDescription>
            Upload a PDF or DOCX file up to 10 MB. ClauseWise will process it
            after upload.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isNewDocument && (
            <>
              <label className="block space-y-1.5 text-sm font-medium">
                Document name
                <Input
                  name="title"
                  placeholder="e.g. Annual safety audit"
                  maxLength={200}
                  required
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                Document type
                <select
                  name="type"
                  defaultValue="AUDIT_REPORT"
                  required
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="block space-y-1.5 text-sm font-medium">
            File
            <Input
              name="file"
              type="file"
              accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
            />
            <span className="block text-xs font-normal text-muted-foreground">
              PDF or DOCX, maximum 10 MB.
            </span>
          </label>
          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Start upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
