import { describe, it, expect, vi, afterEach } from "vitest";
import { AppError } from "@/lib/errors";
import { toActionResult } from "@/lib/action-result";

afterEach(() => vi.restoreAllMocks());

describe("AppError", () => {
  it("defaults to status 400 and keeps message/name", () => {
    const err = new AppError("nope");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AppError");
    expect(err.message).toBe("nope");
    expect(err.status).toBe(400);
  });

  it("accepts a custom status", () => {
    expect(new AppError("forbidden", 403).status).toBe(403);
  });
});

describe("toActionResult", () => {
  it("returns the callback result on success", async () => {
    await expect(toActionResult(async () => ({ success: "ok" }))).resolves.toEqual({
      success: "ok",
    });
  });

  it("passes through { error } results returned by the callback", async () => {
    await expect(toActionResult(async () => ({ error: "Board not found" }))).resolves.toEqual({
      error: "Board not found",
    });
  });

  it("exposes the message of an AppError", async () => {
    const result = await toActionResult(async () => {
      throw new AppError("Administrator rights required", 403);
    });
    expect(result).toEqual({ error: "Administrator rights required" });
  });

  it("hides the message of an unexpected error and logs it", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const secret = new Error("connect ECONNREFUSED postgres://user:pass@db:5432");

    const result = await toActionResult(async () => {
      throw secret;
    });

    expect(result).toEqual({ error: "Something went wrong. Please try again." });
    expect(JSON.stringify(result)).not.toContain("postgres");
    expect(spy).toHaveBeenCalledWith("[action]", secret);
  });

  it("handles non-Error throwables safely", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await toActionResult(async () => {
      throw "boom";
    });
    expect(result).toEqual({ error: "Something went wrong. Please try again." });
  });
});
