import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAuthPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  return { userId, orgId };
}
