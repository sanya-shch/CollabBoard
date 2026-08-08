"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";

interface OrgItemProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  isActive: boolean;
}

export const OrgItem = ({ id, name, imageUrl, isActive }: OrgItemProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initials = name.slice(0, 1).toUpperCase();

  const hintLabel = isActive ? `${name} (Current)` : name;

  const onClick = () => {
    if (isActive || isPending) return;

    startTransition(async () => {
      await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: id }),
      });
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="aspect-square relative">
      <Hint label={hintLabel} side="right" align="start" sideOffset={18}>
        <button
          onClick={onClick}
          disabled={isPending}
          title={name}
          className={cn(
            "h-10 w-10 rounded-xl bg-white/25 opacity-60 hover:opacity-100 transition",
            isActive ? "opacity-100" : "cursor-pointer",
          )}
        >
          {imageUrl ? <Image src={imageUrl} alt={name} fill className="object-cover" /> : initials}
        </button>
      </Hint>
    </div>
  );
};
