"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const UserMenu = ({ name, email, image }: UserMenuProps) => {
  const router = useRouter();

  const initials = (name ?? email ?? "?").slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="outline-none"
        nativeButton={false}
        render={
          <Avatar className="h-8 w-8 cursor-pointer">
            {image && <AvatarImage src={image} alt={name ?? "User"} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {name}
            <div className="text-xs font-normal text-muted-foreground truncate">{email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
