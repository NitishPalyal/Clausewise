export function isAiServiceUnavailable(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("status" in error)
  ) {
    return false;
  }

  return error.status === 429 || error.status === 503;
}
