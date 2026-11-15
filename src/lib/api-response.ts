import type { APIResponse } from "@/shared/types";

const API_ERROR_MESSAGES = new Map<string, string>([
  [
    "CHAT_NOT_FOUND",
    "This conversation could not be found. It may have been deleted.",
  ],
  [
    "CHAT_SEND_FAILED",
    "We couldn't send your message right now. Please try again shortly.",
  ],
  [
    "DOCUMENT_DELETE_FAILED",
    "We couldn't delete this document right now. Please try again.",
  ],
  [
    "DOCUMENT_NOT_FOUND",
    "This document could not be found or is no longer available.",
  ],
  [
    "DOCUMENT_VERSION_NOT_FOUND",
    "This document version could not be found or is no longer available.",
  ],
  ["FORBIDDEN", "You don't have permission to perform this action."],
  [
    "INVALID_REQUEST_DATA",
    "Some information is missing or invalid. Check it and try again.",
  ],
  [
    "STORAGE_CLEANUP_FAILED",
    "The document version was deleted, but its stored file could not be removed.",
  ],
  [
    "TENANT_NOT_FOUND",
    "The selected organization could not be found. Select an organization and try again.",
  ],
  ["UNAUTHORIZED", "Your session has expired. Sign in again and retry."],
  [
    "UNSUPPORTED_FILE_TYPE",
    "This file type isn't supported. Choose a PDF or DOCX file.",
  ],
  [
    "USER_EMAIL_REQUIRED",
    "Your account needs an email address before you can start a chat.",
  ],
]);

export class UserFacingApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingApiError";
  }
}

function isAbortError(error: unknown): error is Error {
  return error instanceof Error && error.name === "AbortError";
}

function getErrorCode(value: APIResponse<unknown>): string | undefined {
  const error = value.error;
  return error && typeof error.code === "string" ? error.code : undefined;
}

function getStatusMessage(
  status: number,
  code: string | undefined,
  fallback: string,
): string {
  if (code) {
    const message = API_ERROR_MESSAGES.get(code);
    if (message) return message;
  }

  if (status === 401)
    return "Your session has expired. Sign in again and retry.";
  if (status === 403)
    return "You don't have permission to perform this action.";
  if (status === 404) {
    return "The requested item could not be found or is no longer available.";
  }
  if (status === 413) {
    return "The selected file is too large. Choose a smaller file and try again.";
  }
  if (status === 429) {
    return "Too many requests were made. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return `${fallback} A temporary service problem occurred. Please try again shortly.`;
  }
  if (status >= 400) {
    return "Some information is missing or invalid. Check it and try again.";
  }

  return fallback;
}

function isApiResponse(value: unknown): value is APIResponse<unknown> {
  if (typeof value !== "object" || value === null) return false;

  const response = value as Record<string, unknown>;
  return (
    typeof response.success === "boolean" &&
    typeof response.message === "string" &&
    "data" in response
  );
}

export async function readApiResponse<T>(
  response: Response,
  fallback: string,
): Promise<APIResponse<T>> {
  let body: string;
  try {
    body = await response.text();
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new UserFacingApiError(
      getStatusMessage(response.status, undefined, fallback),
    );
  }

  if (!body.trim()) {
    throw new UserFacingApiError(
      getStatusMessage(response.status, undefined, fallback),
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new UserFacingApiError(
      getStatusMessage(response.status, undefined, fallback),
    );
  }

  if (!isApiResponse(parsed)) {
    throw new UserFacingApiError(
      getStatusMessage(response.status, undefined, fallback),
    );
  }

  if (!response.ok || !parsed.success) {
    throw new UserFacingApiError(
      getStatusMessage(response.status, getErrorCode(parsed), fallback),
    );
  }

  return parsed as APIResponse<T>;
}

export async function fetchApiResponse<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallback: string,
): Promise<APIResponse<T>> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new UserFacingApiError(
      "Unable to connect to ClauseWise. Check your connection and try again.",
    );
  }

  return readApiResponse<T>(response, fallback);
}

export function getUserFacingErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof UserFacingApiError ? error.message : fallback;
}
