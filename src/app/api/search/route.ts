import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = await req.json().catch(() => ({ query: "" }));

  return NextResponse.json({
    query,
    results: [],
    message: "ClauseWise search vector query API placeholder.",
  });
}
