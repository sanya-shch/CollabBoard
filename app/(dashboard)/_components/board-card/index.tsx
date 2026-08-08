"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { Actions } from "@/components/board-actions";
import { toggleFavorite } from "@/actions/board";

import { Footer } from "./footer";

interface BoardCardProps {
  id: string;
  title: string;
  imageUrl: string;
  authorName: string;
  createdAt: Date;
  isFavorite: boolean;
}

export const BoardCard = ({
  id,
  title,
  imageUrl,
  authorName,
  createdAt,
  isFavorite,
}: BoardCardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const createdAtLabel = formatDistanceToNow(createdAt, { addSuffix: true });

  const onFavorite = () => {
    startTransition(async () => {
      await toggleFavorite(id);
      router.refresh();
    });
  };

  return (
    <Link href={`/board/${id}`}>
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-sky-50">
          <Image src={imageUrl} alt={title} fill className="object-fit" />

          <div className="opacity-0 group-hover:opacity-50 transition-opacity h-full w-full bg-black" />

          <Actions id={id} title={title}>
            <button
              onClick={(e) => e.preventDefault()}
              className="absolute top-1 right-1 px-3 py-2 outline-none cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4 text-white" />
            </button>
          </Actions>
        </div>

        <Footer
          isFavorite={isFavorite}
          title={title}
          authorLabel={authorName}
          createdAtLabel={createdAtLabel}
          onClick={onFavorite}
          disabled={isPending}
        />
      </div>
    </Link>
  );
};

export const BoardCardSkeleton = () => (
  <div className="aspect-[100/127] rounded-lg overflow-hidden">
    <Skeleton className="h-full w-full" />
  </div>
);
