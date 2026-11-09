import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuthPage } from "@/lib/helper/pageAuth.helper";
import * as DocumentRepo from "@/repository/document/document.repository";
import { DocumentsList } from "@/components/documents/documents-list";

export const metadata: Metadata = {
  title: "Documents | ClauseWise",
  description: "Manage and upload your manufacturing compliance documents, SOPs, and certificates.",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { orgId } = await requireAuthPage();
  if (!orgId) redirect("/dashboard");

  const [{ notice }, documents] = await Promise.all([
    searchParams,
    DocumentRepo.findDocumentsForTenant(orgId),
  ]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <DocumentsList
        tenantId={orgId}
        storageCleanupWarning={notice === "storage-cleanup-failed"}
        documents={documents.map((document) => ({
          ...document,
          uploadedAt: document.versions[0]?.uploadedAt.toISOString() ?? null,
          versionCount: document._count.versions,
        }))}
      />
    </div>
  );
}
