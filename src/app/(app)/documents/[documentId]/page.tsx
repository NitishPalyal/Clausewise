import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireAuthPage } from "@/lib/helper/pageAuth.helper";
import { findRoleForTenant } from "@/repository/user/user.repository";
import * as DocumentRepo from "@/repository/document/document.repository";
import { DocumentDetails } from "@/components/documents/document-details";

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

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <DocumentDetails
        tenantId={orgId}
        isManager={role === "MANAGER"}
        document={{
          ...document,
          versions: document.versions.map((version) => ({
            ...version,
            uploadedAt: version.uploadedAt.toISOString(),
          })),
        }}
      />
    </div>
  );
}
