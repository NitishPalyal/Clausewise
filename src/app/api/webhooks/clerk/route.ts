// app/api/webhooks/clerk/route.ts
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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
        id: event.data.id, // Clerk's own org id — reused as your Tenant id
        name: event.data.name,
      },
    });
  }

  if (event.type === "organizationMembership.created") {
    const clerkRole = event.data.role; // "org:admin" or "org:member"

    await prisma.user.upsert({
      where: { clerkUserId: event.data.public_user_data.user_id },
      update: { role: clerkRole === "org:admin" ? "MANAGER" : "MEMBER" },
      create: {
        clerkUserId: event.data.public_user_data.user_id,
        email: event.data.public_user_data.identifier,
        tenantId: event.data.organization.id,
        role: clerkRole === "org:admin" ? "MANAGER" : "MEMBER",
      },
    });
  }

  return new Response("OK", { status: 200 });
}
