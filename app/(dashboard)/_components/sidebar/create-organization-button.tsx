"use client";

import { Plus } from "lucide-react";
import { useCreateOrganizationModal } from "@/store/use-create-organization-modal";

export const NewButton = () => {
  const { onOpen } = useCreateOrganizationModal();

  return (
    <div className="aspect-square">
      <button
        onClick={onOpen}
        className="bg-white/25 h-10 w-10 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 transition cursor-pointer"
        title="Create Team"
      >
        <Plus className="text-white" />
      </button>
    </div>
  );
};
