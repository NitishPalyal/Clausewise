import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { vectorSearch } from "@/retrievalPipeline/vectorSearch/vectorSearch.ts";

function unitVector(biasIndices: number[], n = 768): number[] {
  const v = Array.from({ length: n }, () => Math.random() * 0.1 - 0.05);
  for (const i of biasIndices) v[i] = 0.6;
  const magnitude = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  return v.map((x) => x / magnitude);
}

const queryVector = unitVector([0, 1]);
const closeVector = unitVector([0, 1]);
const farVector = unitVector([400, 401]);
const sameDirectionWrongTenant = unitVector([0, 1]);
const sameDirectionOldVersion = unitVector([0, 1]);

beforeAll(async () => {
  await prisma.$executeRaw`INSERT INTO "Document" VALUES ('t_doc1','tenantA',NULL,'SOP-014','AUDIT_REPORT')`;
  await prisma.$executeRaw`INSERT INTO "Document" VALUES ('t_doc2','tenantB',NULL,'Other Tenant SOP','AUDIT_REPORT')`;
  await prisma.$executeRaw`INSERT INTO "DocumentVersion" VALUES ('t_ver1','t_doc1',2,'b2://v2.pdf',true,NULL,now())`;
  await prisma.$executeRaw`INSERT INTO "DocumentVersion" VALUES ('t_ver1_old','t_doc1',1,'b2://v1.pdf',false,NULL,now())`;
  await prisma.$executeRaw`INSERT INTO "DocumentVersion" VALUES ('t_ver2','t_doc2',1,'b2://other.pdf',true,NULL,now())`;

  const insertChunk = (
    id: string,
    tenantId: string,
    versionId: string,
    text: string,
    vector: number[],
  ) =>
    prisma.$executeRawUnsafe(
      `INSERT INTO "Chunk" VALUES ('${id}','${tenantId}','${versionId}','Section',1,0,1,1,'${text}','[${vector.join(",")}]')`,
    );

  await insertChunk(
    "t_chunkA_close",
    "tenantA",
    "t_ver1",
    "Check the certificate and dimensions.",
    closeVector,
  );
  await insertChunk(
    "t_chunkA_far",
    "tenantA",
    "t_ver1",
    "Keep logs for three years.",
    farVector,
  );
  await insertChunk(
    "t_chunkB_other_tenant",
    "tenantB",
    "t_ver2",
    "Tenant B private text.",
    sameDirectionWrongTenant,
  );
  await insertChunk(
    "t_chunkA_old_version",
    "tenantA",
    "t_ver1_old",
    "Old revision, must not appear.",
    sameDirectionOldVersion,
  );
});

afterAll(async () => {
  await prisma.$executeRaw`DELETE FROM "Chunk" WHERE id LIKE 't\\_%'`;
  await prisma.$executeRaw`DELETE FROM "DocumentVersion" WHERE id LIKE 't\\_%'`;
  await prisma.$executeRaw`DELETE FROM "Document" WHERE id LIKE 't\\_%'`;
  await prisma.$disconnect();
});

describe("vectorSearch", () => {
  it("returns only the current tenant's current-version chunks, closest first", async () => {
    const results = await vectorSearch(queryVector, "tenantA", 20);
    const ids = results.map((r) => r.id);
    expect(ids).toEqual(["t_chunkA_close", "t_chunkA_far"]);
    expect(ids).not.toContain("t_chunkB_other_tenant");
    expect(ids).not.toContain("t_chunkA_old_version");
  });

  it("keeps a tenant's search scoped to only that tenant's own data", async () => {
    const results = await vectorSearch(queryVector, "tenantB", 20);
    expect(results.map((r) => r.id)).toEqual(["t_chunkB_other_tenant"]);
  });

  it("rejects a query vector with the wrong number of dimensions before touching the database", async () => {
    await expect(vectorSearch([1, 2, 3], "tenantA")).rejects.toThrow(/768/);
  });

  it("returns an empty array for a tenant with no chunks at all", async () => {
    expect(await vectorSearch(queryVector, "tenant_with_nothing", 20)).toEqual(
      [],
    );
  });
});
