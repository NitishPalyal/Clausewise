import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireAuthPage } from "@/lib/helper/pageAuth.helper";
import { findRoleForTenant } from "@/repository/user/user.repository";
import * as DocumentRepo from "@/repository/document/document.repository";
import { DocumentDetails } from "@/components/documents/document-details";
import { DocumentPreview } from "@/components/documents/document-preview";
import { getDocumentFileType } from "@/lib/helper/getDocumentFileType.helper";

export const metadata: Metadata = {
  title: "Document details | ClauseWise",
  description: "View document upload history and manage its versions.",
};

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const { orgId, userId } = await requireAuthPage();
  if (!orgId) redirect("/dashboard");

  const [document, role] = await Promise.all([
    DocumentRepo.findDocumentDetailsForTenant(documentId, orgId),
    findRoleForTenant(userId, orgId),
  ]);
  if (!document) notFound();

  const detailVersions = document.versions.map((version) => ({
    id: version.id,
    versionNumber: version.versionNumber,
    uploadedAt: version.uploadedAt.toISOString(),
    isCurrent: version.isCurrent,
    status: version.status,
  }));
  const previewVersions = document.versions.map((version) => ({
    id: version.id,
    versionNumber: version.versionNumber,
    isCurrent: version.isCurrent,
    fileType: getDocumentFileType(version.fileUrl),
  }));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <DocumentDetails
        tenantId={orgId}
        isManager={role === "MANAGER"}
        document={{
          ...document,
          versions: detailVersions,
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6">
        <DocumentPreview
          key={
            previewVersions.find((version) => version.isCurrent)?.id ??
            document.id
          }
          documentId={document.id}
          documentTitle={document.title}
          versions={previewVersions}
        />
      </div>
    </div>
  );
}
