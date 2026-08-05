"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useQuery } from "convex/react";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Actions } from "@/components/board-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useRenameModal } from "@/store/use-rename-modal";

interface InfoProps {
  boardId: string;
}

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const TabSeparator = () => {
  return <div className="text-neutral-300 px-1.5">|</div>;
};

export const Info = ({ boardId }: InfoProps) => {
  const { onOpen } = useRenameModal();

  const data = useQuery(api.board.get, {
    id: boardId as Id<"boards">,
  });

  if (!data) return <InfoSkeleton />;

  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
      <Link href="/" className={cn(buttonVariants({ variant: "board" }), "px-2")}>
        <Image src="/logo.svg" alt="Board logo" height={24} width={24} />
        <span className={cn("font-semibold text-xl ml-2 text-black", font.className)}>Board</span>
      </Link>

      <TabSeparator />

      <Button
        variant="board"
        className="text-base font-normal px-2 cursor-pointer"
        onClick={() => onOpen(data._id, data.title)}
      >
        {data.title}
      </Button>

      <TabSeparator />

      <Actions id={data._id} title={data.title} side="bottom" sideOffset={10}>
        <Button size="icon" variant="board" className="cursor-pointer">
          <Menu />
        </Button>
      </Actions>
    </div>
  );
};

export const InfoSkeleton = () => {
  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]" />
  );
};
