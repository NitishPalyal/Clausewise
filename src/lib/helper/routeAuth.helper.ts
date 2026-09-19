import { auth } from "@clerk/nextjs/server";

export async function requireAuthRoute() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return {
      ok: false as const,
      response: new Response("Unauthorized", { status: 401 }),
    };
  }
  return { ok: true as const, userId, orgId };
}
