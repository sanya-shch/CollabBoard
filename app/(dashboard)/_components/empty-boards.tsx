"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBoard } from "@/actions/board";

interface EmptyBoardsProps {
  organizationId: string;
}

export const EmptyBoards = ({ organizationId }: EmptyBoardsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const result = await createBoard({
        organizationId,
        title: "Untitled",
        imageUrl: "file.svg",
      });

      if ("board" in result) router.push(`/board/${result.board!.id}`);
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mt-6">No boards yet</h2>

      <p className="text-muted-foreground text-sm mt-2">Create a board for this team</p>

      <div className="mt-6">
        <Button disabled={isPending} onClick={onClick} size="lg" className="cursor-pointer">
          Create a board
        </Button>
      </div>
    </div>
  );
};
