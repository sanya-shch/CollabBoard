import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

import { Room } from "@/components/room";
import { RenameModal } from "@/components/modals/rename-modal";

import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/loading";

interface BoardIdPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const { boardId } = await params;

  const board = await db.board.findUnique({ where: { id: boardId } });
  if (!board) return notFound();

  const boardData = { id: board.id, title: board.title };

  const user = await getCurrentUser();

  if (user) {
    const membership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: board.organizationId,
        },
      },
    });

    if (membership) {
      return (
        <>
          <Room roomId={boardId} fallback={<Loading />}>
            <Canvas board={boardData} />
          </Room>
          <RenameModal />
        </>
      );
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
      return (
        <>
          <Room roomId={boardId} fallback={<Loading />}>
            <Canvas board={boardData} />
          </Room>
          <RenameModal />
        </>
      );
    }
  }

  redirect("/login");
};

export default BoardIdPage;
