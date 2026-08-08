import { Organization } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/current-user";

import { SearchInput } from "./search-input";
import { InviteButton } from "./invite-button";
import { UserMenu } from "./user-menu";

interface NavbarProps {
  organization: Organization;
}

export const Navbar = async ({ organization }: NavbarProps) => {
  const user = await requireAuth();

  return (
    <div className="flex items-center gap-x-4 p-5">
      <div className="hidden lg:flex lg:flex-1">
        <SearchInput />
      </div>

      <InviteButton organizationId={organization.id} />

      <UserMenu name={user.name} email={user.email} image={user.image} />
    </div>
  );
};
