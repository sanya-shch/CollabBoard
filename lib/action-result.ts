export async function toActionResult<T extends Record<string, unknown>>(
  fn: () => Promise<T>,
): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Something went wrong" };
  }
}
