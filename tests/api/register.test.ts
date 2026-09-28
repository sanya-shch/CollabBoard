import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/db";
import { sendVerificationEmailMock } from "../mocks/mail";

vi.mock("@/lib/password", () => ({ hashPassword: vi.fn(), verifyPassword: vi.fn() }));

import { hashPassword } from "@/lib/password";
import { POST } from "@/app/api/auth/register/route";

let n = 0;
const register = (body: unknown, ip = `10.2.0.${++n}`) =>
  POST(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "x-forwarded-for": ip, "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const valid = { name: "Ann", email: "ann@a.com", password: "secret123" };

const invite = (overrides = {}) =>
  ({
    id: "inv1",
    email: "ann@a.com",
    organizationId: "org_9",
    role: "MEMBER",
    token: "invite-token",
    expiresAt: new Date(Date.now() + 60_000),
    ...overrides,
  }) as never;

beforeEach(() => {
  vi.mocked(hashPassword).mockResolvedValue("hashed-pw");
  // Run the transaction callback against the same mocked client.
  prismaMock.$transaction.mockImplementation((async (fn: (tx: unknown) => unknown) =>
    fn(prismaMock)) as never);
  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.create.mockResolvedValue({ id: "abcdef123456", email: "ann@a.com" } as never);
  prismaMock.organization.create.mockResolvedValue({ id: "org_new" } as never);
  prismaMock.verificationToken.create.mockResolvedValue({
    id: "vt1",
    email: "ann@a.com",
    token: "verify-token",
    expires: new Date(),
  });
});

describe("POST /api/auth/register - validation", () => {
  it("returns 400 for invalid data and does not touch the database", async () => {
    const res = await register({ name: "", email: "nope", password: "123" });

    expect(res.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1" } as never);

    const res = await register(valid);

    expect(res.status).toBe(409);
    expect(hashPassword).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/register - new team", () => {
  it("creates the user with a hashed password, a personal team and an ADMIN membership", async () => {
    const res = await register(valid);

    expect(res.status).toBe(200);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { name: "Ann", email: "ann@a.com", hashedPassword: "hashed-pw" },
    });
    expect(JSON.stringify(prismaMock.user.create.mock.calls)).not.toContain("secret123");

    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: { name: "Ann's Team", slug: "ann-s-team-abcdef" },
    });
    expect(prismaMock.membership.create).toHaveBeenCalledWith({
      data: { userId: "abcdef123456", organizationId: "org_new", role: "ADMIN" },
    });
  });

  it("sends a verification email and does not log the user in", async () => {
    const res = await register(valid);

    expect(sendVerificationEmailMock).toHaveBeenCalledWith("ann@a.com", "verify-token");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("returns 502 when the verification email cannot be sent (account is still created)", async () => {
    sendVerificationEmailMock.mockRejectedValue(new Error("smtp down"));

    const res = await register(valid);

    expect(res.status).toBe(502);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/auth/register - with an invitation", () => {
  const withInvite = { ...valid, inviteToken: "invite-token" };

  it("joins the invited team with the invited role and consumes the invite", async () => {
    prismaMock.invite.findUnique.mockResolvedValue(invite({ role: "ADMIN" }));

    const res = await register(withInvite);

    expect(res.status).toBe(200);
    expect(prismaMock.membership.create).toHaveBeenCalledWith({
      data: { userId: "abcdef123456", organizationId: "org_9", role: "ADMIN" },
    });
    expect(prismaMock.invite.delete).toHaveBeenCalledWith({ where: { id: "inv1" } });
    expect(prismaMock.organization.create).not.toHaveBeenCalled();
  });

  it("matches the invited email case-insensitively", async () => {
    prismaMock.invite.findUnique.mockResolvedValue(invite({ email: "ANN@A.COM" }));

    expect((await register(withInvite)).status).toBe(200);
  });

  it("rejects an unknown invitation", async () => {
    prismaMock.invite.findUnique.mockResolvedValue(null);

    const res = await register(withInvite);

    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an expired invitation", async () => {
    prismaMock.invite.findUnique.mockResolvedValue(
      invite({ expiresAt: new Date(Date.now() - 1000) }),
    );

    const res = await register(withInvite);

    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an invitation issued to a different email", async () => {
    prismaMock.invite.findUnique.mockResolvedValue(invite({ email: "someone-else@a.com" }));

    const res = await register(withInvite);

    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/register - rate limiting", () => {
  it("returns 429 with Retry-After after 5 attempts from one IP", async () => {
    const ip = "203.0.113.120";
    for (let i = 0; i < 5; i++) expect((await register(valid, ip)).status).toBe(200);

    const blocked = await register(valid, ip);

    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
  });
});
