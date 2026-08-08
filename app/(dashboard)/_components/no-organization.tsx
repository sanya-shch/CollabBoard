"use client";

import { Button } from "@/components/ui/button";
import { useCreateOrganizationModal } from "@/store/use-create-organization-modal";

export const NoOrganization = () => {
  const { onOpen } = useCreateOrganizationModal();

  return (
    <div className="flex flex-col items-center gap-y-4 text-center px-4">
      <h2 className="text-2xl font-semibold">You don&apos;t have a team yet</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        Create a team to start creating boards and inviting colleagues
      </p>
      <Button onClick={onOpen} size="lg">
        Create a team
      </Button>
    </div>
  );
};
