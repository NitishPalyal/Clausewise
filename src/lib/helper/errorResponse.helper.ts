import { APIResponse } from "@/shared/types";
import { NextResponse } from "next/server";

export function errorResponse(message: string, code: string, status: number) {
  const response: APIResponse = {
    success: false,
    message,
    data: null,
    error: { code },
  };

  return NextResponse.json(response, { status });
}
