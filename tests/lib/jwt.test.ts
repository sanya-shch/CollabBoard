import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken } from "@/lib/jwt";

describe("session JWT", () => {
  it("round-trips a valid payload", async () => {
    const token = await signSessionToken({ userId: "user_1" });
    const payload = await verifySessionToken(token);

    expect(payload).toEqual({ userId: "user_1" });
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken({ userId: "user_1" });
    const tampered = token.slice(0, -2) + (token.slice(-2) === "aa" ? "bb" : "aa");

    const payload = await verifySessionToken(tampered);

    expect(payload).toBeNull();
  });

  it("rejects garbage input instead of throwing", async () => {
    const payload = await verifySessionToken("not-a-jwt-at-all");

    expect(payload).toBeNull();
  });

  it("rejects a token with a forged signature", async () => {
    const token = await signSessionToken({ userId: "user_1" });
    const [header, payload] = token.split(".");
    const forged = `${header}.${payload}.forged-signature`;

    const result = await verifySessionToken(forged);

    expect(result).toBeNull();
  });
});
