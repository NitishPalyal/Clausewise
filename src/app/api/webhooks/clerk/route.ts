import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/** Syncs verified organization and membership events to the local database. */
export async function POST(req: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch {
    return new Response("Verification failed", { status: 400 });
  }

  if (event.type === "organization.created") {
    await prisma.tenant.upsert({
      where: { id: event.data.id },
      update: {},
      create: {
        id: event.data.id, // Clerk organization IDs are used as local tenant IDs.
        name: event.data.name,
      },
    });
  }
  if (event.type === "organization.deleted") {
    if (!event.data.id) {
      return new Response("Missing organization ID", { status: 400 });
    }

    await prisma.tenant.deleteMany({
      where: { id: event.data.id },
    });
  }

  if (event.type === "organizationMembership.deleted") {
    await prisma.user.deleteMany({
      where: {
        clerkUserId: event.data.public_user_data.user_id,
        tenantId: event.data.organization.id,
      },
    });
  }

  if (
    event.type === "organizationMembership.created" ||
    event.type === "organizationMembership.updated"
  ) {
    const clerkRole = event.data.role;
    const role = clerkRole === "org:admin" ? "MANAGER" : "MEMBER";
    const clerkUserId = event.data.public_user_data.user_id;
    const email = event.data.public_user_data.identifier;
    const tenantId = event.data.organization.id;

    await prisma.user.upsert({
      where: { clerkUserId },
      update: { email, tenantId, role },
      create: {
        clerkUserId,
        email,
        tenantId,
        role,
      },
    });
  }

  return new Response("OK", { status: 200 });
}
