"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import { createBoard } from "@/actions/board";

interface NewBoardButtonProps {
  organizationId: string;
  disabled?: boolean;
}

const PLACEHOLDER_IMAGE = "file.svg";

export const NewBoardButton = ({ organizationId, disabled }: NewBoardButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const result = await createBoard({
        organizationId,
        title: "Untitled",
        imageUrl: PLACEHOLDER_IMAGE,
      });

      if ("board" in result) {
        router.push(`/board/${result.board!.id}`);
      }
    });
  };

  return (
    <button
      disabled={disabled || isPending}
      onClick={onClick}
      className={cn(
        "col-span-1 aspect-[100/127] bg-sky-600 rounded-lg cursor-pointer hover:bg-sky-800 flex flex-col items-center justify-center py-6",
        (disabled || isPending) && "opacity-75 hover:bg-sky-600 cursor-not-allowed",
      )}
    >
      <Plus className="h-12 w-12 text-white stroke-1" />
    </button>
  );
};
