import { Liveblocks } from "@liveblocks/node";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  const { room } = await request.json();
  const boardId = room;

  const board = await db.board.findUnique({ where: { id: boardId } });
  if (!board) return new Response("Not found", { status: 404 });

  const user = await getCurrentUser();

  if (user) {
    const membership = await db.membership.findUnique({
      where: {
        userId_organizationId: { userId: user.id, organizationId: board.organizationId },
      },
    });

    if (membership) {
      const ls = liveblocks.prepareSession(user.id, {
        userInfo: {
          name: user.name ?? "Teammeate",
          picture: user.image ?? undefined,
        },
      });
      ls.allow(room, ls.FULL_ACCESS);
      const { status, body } = await ls.authorize();
      return new Response(body, { status });
    }
  }

  const cookieStore = await cookies();
  const shareToken = cookieStore.get(`share_${boardId}`)?.value;

  if (shareToken) {
    const link = await db.boardShareLink.findUnique({ where: { token: shareToken } });
    const isValid =
      link &&
      link.boardId === boardId &&
      !link.revoked &&
      (!link.expiresAt || link.expiresAt > new Date());

    if (isValid) {
      const guestId = `guest:${crypto.randomUUID()}`;
      const ls = liveblocks.prepareSession(guestId, {
        userInfo: { name: "Guest", picture: undefined },
      });
      ls.allow(room, ls.FULL_ACCESS);
      const { status, body } = await ls.authorize();
      return new Response(body, { status });
    }
  }

  return new Response("Forbidden", { status: 403 });
}
