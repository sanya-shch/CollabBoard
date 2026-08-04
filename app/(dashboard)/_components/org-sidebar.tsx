"use client";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { LayoutDashboard, Star } from "lucide-react";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export const OrgSidebar = () => {
  const searchParams = useSearchParams();
  const favorites = searchParams.get("favorites");

  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
      <Link href="/">
        <div className="flex items-center gap-x-2">
          <Image src="/logo.svg" alt="Logo" height={30} width={30} />
          <span className={cn("font-semibold text-2xl", font.className)}>Boards</span>
        </div>
      </Link>
      <OrganizationSwitcher
        hidePersonal
        appearance={{
          elements: {
            rootBox: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            },
            organizationSwitcherTrigger: {
              padding: "6px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              justifyContent: "space-between",
              backgroundColor: "white",
            },
          },
        }}
      />
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
      </div>
    </div>
  );
};
