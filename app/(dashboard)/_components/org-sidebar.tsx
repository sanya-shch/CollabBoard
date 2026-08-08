"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutDashboard, Star, Settings } from "lucide-react";
import { Organization } from "@/generated/prisma/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { useOrganizationSettingsModal } from "@/store/use-organization-settings-modal";
import { cn } from "@/lib/utils";

interface OrgSidebarProps {
  organization: Organization;
}

export const OrgSidebar = ({ organization }: OrgSidebarProps) => {
  const searchParams = useSearchParams();
  const favorites = searchParams.get("favorites");
  const { onOpen } = useOrganizationSettingsModal();

  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
      <Link href="/">
        <div className="flex items-center gap-x-2">
          <span className="font-semibold text-2xl">{organization.name}</span>
        </div>
      </Link>

      <div className="space-y-1 w-full">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: favorites ? "ghost" : "secondary", size: "lg" }),
            "font-normal justify-start px-2 w-full",
          )}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Team boards
        </Link>

        <Link
          href={{
            pathname: "/",
            query: { favorites: true },
          }}
          className={cn(
            buttonVariants({ variant: favorites ? "secondary" : "ghost", size: "lg" }),
            "font-normal justify-start px-2 w-full",
          )}
        >
          <Star className="h-4 w-4 mr-2" />
          Favorite boards
        </Link>

        <Button
          variant="ghost"
          size="lg"
          className="font-normal justify-start px-2 w-full cursor-pointer"
          onClick={() => onOpen(organization.id)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Team settings
        </Button>
      </div>
    </div>
  );
};
