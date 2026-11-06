"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";

type UploadRequest = {
  tenantId: string;
  documentId?: string;
};

type DocumentUploadContextValue = {
  openDocumentUpload: (request: UploadRequest) => void;
};

const DocumentUploadContext =
  createContext<DocumentUploadContextValue | null>(null);

export function DocumentUploadProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<UploadRequest | null>(null);

  return (
    <DocumentUploadContext.Provider
      value={{ openDocumentUpload: setRequest }}
    >
      {children}
      {request && (
        <DocumentUploadDialog
          key={request.documentId ?? "new"}
          tenantId={request.tenantId}
          {...(request.documentId
            ? { documentId: request.documentId }
            : {})}
          mode={request.documentId ? "version" : "new"}
          open
          onClose={() => setRequest(null)}
        />
      )}
    </DocumentUploadContext.Provider>
  );
}

export function useDocumentUpload() {
  const context = useContext(DocumentUploadContext);
  if (!context) {
    throw new Error(
      "useDocumentUpload must be used within a DocumentUploadProvider",
    );
  }
  return context.openDocumentUpload;
}
