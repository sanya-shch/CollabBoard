import { AppError } from "@/lib/errors";

export async function toActionResult<T extends Record<string, unknown>>(
  fn: () => Promise<T>,
): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AppError) {
      // Expected, user-facing error - safe to show as-is.
      return { error: err.message };
    }

    // Unexpected error (DB, network, bug) - never leak its message to the client.
    // TODO: wire this into real error tracking (Sentry, etc).
    console.error("[action]", err);
    return { error: "Something went wrong. Please try again." };
  }
}
