import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/db";
import { currentUserMock } from "../mocks/current-user";

const { allowMock, authorizeMock, prepareSessionMock, cookiesMock } = vi.hoisted(() => {
  const allowMock = vi.fn();
  const authorizeMock = vi.fn().mockResolvedValue({ status: 200, body: "session-token-body" });
  const prepareSessionMock = vi.fn(() => ({
    allow: allowMock,
    authorize: authorizeMock,
    FULL_ACCESS: "room:write",
    READ_ACCESS: "room:read",
  }));
  const cookiesMock = vi.fn();
  return { allowMock, authorizeMock, prepareSessionMock, cookiesMock };
});

vi.mock("@liveblocks/node", () => ({
  Liveblocks: vi.fn().mockImplementation(function MockLiveblocks() {
    return { prepareSession: prepareSessionMock };
  }),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));

import { POST } from "@/app/api/liveblocks-auth/route";

const request = (room = "board_1") =>
  new Request("http://localhost/api/liveblocks-auth", {
    method: "POST",
    body: JSON.stringify({ room }),
  });

const cookieJar = (value?: string) => ({
  get: (name: string) => (name === "share_board_1" && value ? { value } : undefined),
});

beforeEach(() => {
  allowMock.mockClear();
  authorizeMock.mockClear();
  prepareSessionMock.mockClear();
  cookiesMock.mockResolvedValue(cookieJar());
  currentUserMock.mockResolvedValue(null);
});

describe("POST /api/liveblocks-auth", () => {
  it("returns 404 for a room whose board does not exist", async () => {
    prismaMock.board.findUnique.mockResolvedValue(null);

    const res = await POST(request());

    expect(res.status).toBe(404);
    expect(prepareSessionMock).not.toHaveBeenCalled();
  });

  it("returns a JSON 500 (not an HTML error page) when the Liveblocks SDK throws", async () => {
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.board.findUnique.mockResolvedValue({
      id: "board_1",
      organizationId: "org_1",
    } as never);
    currentUserMock.mockResolvedValue({ id: "u1", name: "Ann", image: null } as never);
    prismaMock.membership.findUnique.mockResolvedValue({ role: "MEMBER" } as never);
    authorizeMock.mockRejectedValueOnce(new Error("invalid secret key"));

    const res = await POST(request());

    expect(res.status).toBe(500);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body).toEqual({ error: "Something went wrong" });
    expect(logSpy).toHaveBeenCalledWith("[liveblocks-auth]", expect.any(Error));

    logSpy.mockRestore();
  });

  it("grants FULL_ACCESS to a signed-in organization member", async () => {
    prismaMock.board.findUnique.mockResolvedValue({
      id: "board_1",
      organizationId: "org_1",
    } as never);
    currentUserMock.mockResolvedValue({ id: "u1", name: "Ann", image: null } as never);
    prismaMock.membership.findUnique.mockResolvedValue({ role: "MEMBER" } as never);

    const res = await POST(request());

    expect(prepareSessionMock).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ userInfo: expect.objectContaining({ name: "Ann" }) }),
    );
    expect(allowMock).toHaveBeenCalledWith("board_1", "room:write");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("session-token-body");
  });

  it("returns 403 for a signed-in user who is not a member and has no share link", async () => {
    prismaMock.board.findUnique.mockResolvedValue({
      id: "board_1",
      organizationId: "org_1",
    } as never);
    currentUserMock.mockResolvedValue({ id: "u1", name: "Ann", image: null } as never);
    prismaMock.membership.findUnique.mockResolvedValue(null);

    const res = await POST(request());

    expect(res.status).toBe(403);
    expect(prepareSessionMock).not.toHaveBeenCalled();
  });

  it("returns 403 for an anonymous visitor with no share cookie", async () => {
    prismaMock.board.findUnique.mockResolvedValue({
      id: "board_1",
      organizationId: "org_1",
    } as never);

    const res = await POST(request());

    expect(res.status).toBe(403);
  });
});

describe("POST /api/liveblocks-auth - anonymous share-link guests", () => {
  beforeEach(() => {
    prismaMock.board.findUnique.mockResolvedValue({
      id: "board_1",
      organizationId: "org_1",
    } as never);
    cookiesMock.mockResolvedValue(cookieJar("tok"));
  });

  it("grants FULL_ACCESS for an editable share link", async () => {
    prismaMock.boardShareLink.findUnique.mockResolvedValue({
      token: "tok",
      boardId: "board_1",
      revoked: false,
      expiresAt: null,
      canEdit: true,
    } as never);

    await POST(request());

    expect(allowMock).toHaveBeenCalledWith("board_1", "room:write");
    expect(prepareSessionMock).toHaveBeenCalledWith(
      expect.stringMatching(/^guest:/),
      expect.objectContaining({ userInfo: expect.objectContaining({ name: "Guest" }) }),
    );
  });

  it("grants only READ_ACCESS for a read-only share link", async () => {
    prismaMock.boardShareLink.findUnique.mockResolvedValue({
      token: "tok",
      boardId: "board_1",
      revoked: false,
      expiresAt: null,
      canEdit: false,
    } as never);

    await POST(request());

    expect(allowMock).toHaveBeenCalledWith("board_1", "room:read");
    expect(prepareSessionMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userInfo: expect.objectContaining({ name: "Guest (view only)" }) }),
    );
  });

  it("rejects a revoked link", async () => {
    prismaMock.boardShareLink.findUnique.mockResolvedValue({
      token: "tok",
      boardId: "board_1",
      revoked: true,
      expiresAt: null,
      canEdit: true,
    } as never);

    expect((await POST(request())).status).toBe(403);
  });

  it("rejects an expired link", async () => {
    prismaMock.boardShareLink.findUnique.mockResolvedValue({
      token: "tok",
      boardId: "board_1",
      revoked: false,
      expiresAt: new Date(Date.now() - 1000),
      canEdit: true,
    } as never);

    expect((await POST(request())).status).toBe(403);
  });

  it("rejects a link that belongs to a different board", async () => {
    prismaMock.boardShareLink.findUnique.mockResolvedValue({
      token: "tok",
      boardId: "some_other_board",
      revoked: false,
      expiresAt: null,
      canEdit: true,
    } as never);

    expect((await POST(request())).status).toBe(403);
  });

  it("accepts a link with no expiration date", async () => {
    prismaMock.boardShareLink.findUnique.mockResolvedValue({
      token: "tok",
      boardId: "board_1",
      revoked: false,
      expiresAt: null,
      canEdit: true,
    } as never);

    expect((await POST(request())).status).toBe(200);
  });
});
