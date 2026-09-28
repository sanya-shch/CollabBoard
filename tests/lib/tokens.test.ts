import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prismaMock } from "../mocks/db";
import {
  generateVerificationToken,
  generatePasswordResetToken,
  generateOrgInviteToken,
  generateBoardShareToken,
} from "@/lib/tokens";

const NOW = new Date("2026-01-01T00:00:00.000Z");
const HOUR = 60 * 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe("generateVerificationToken", () => {
  it("deletes old tokens for the email and creates a 24h token", async () => {
    await generateVerificationToken("a@a.com");

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { email: "a@a.com" },
    });
    const { data } = prismaMock.verificationToken.create.mock.calls[0][0];
    expect(data.email).toBe("a@a.com");
    expect(data.token).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(data.expires).getTime()).toBe(NOW.getTime() + 24 * HOUR);
  });

  it("generates a different token on each call", async () => {
    await generateVerificationToken("a@a.com");
    await generateVerificationToken("a@a.com");
    const [first, second] = prismaMock.verificationToken.create.mock.calls;
    expect(first[0].data.token).not.toBe(second[0].data.token);
  });
});

describe("generatePasswordResetToken", () => {
  it("deletes old tokens and creates a 1h token", async () => {
    await generatePasswordResetToken("a@a.com");

    expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { email: "a@a.com" },
    });
    const { data } = prismaMock.passwordResetToken.create.mock.calls[0][0];
    expect(new Date(data.expires).getTime()).toBe(NOW.getTime() + HOUR);
  });
});

describe("generateOrgInviteToken", () => {
  it("replaces an existing invite and creates a 7 day invite", async () => {
    await generateOrgInviteToken({ organizationId: "org_1", email: "b@b.com", role: "MEMBER" });

    expect(prismaMock.invite.deleteMany).toHaveBeenCalledWith({
      where: { organizationId: "org_1", email: "b@b.com" },
    });
    const { data } = prismaMock.invite.create.mock.calls[0][0];
    expect(data).toMatchObject({ organizationId: "org_1", email: "b@b.com", role: "MEMBER" });
    expect(new Date(data.expiresAt as Date).getTime()).toBe(NOW.getTime() + 7 * 24 * HOUR);
  });
});

describe("generateBoardShareToken", () => {
  it("creates a 48-char hex token with no expiry by default", async () => {
    await generateBoardShareToken({ boardId: "b1" });

    const { data } = prismaMock.boardShareLink.create.mock.calls[0][0];
    expect(data.boardId).toBe("b1");
    expect(data.token).toMatch(/^[0-9a-f]{48}$/);
    expect(data.expiresAt).toBeNull();
  });

  it("sets expiry when expiresInDays is provided", async () => {
    await generateBoardShareToken({ boardId: "b1", expiresInDays: 2 });

    const { data } = prismaMock.boardShareLink.create.mock.calls[0][0];
    expect(new Date(data.expiresAt as Date).getTime()).toBe(NOW.getTime() + 48 * HOUR);
  });
});
