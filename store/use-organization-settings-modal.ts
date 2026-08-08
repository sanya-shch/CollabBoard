import { create } from "zustand";

interface OrganizationSettingsModalStore {
  isOpen: boolean;
  organizationId?: string;
  onOpen: (organizationId: string) => void;
  onClose: () => void;
}

export const useOrganizationSettingsModal = create<OrganizationSettingsModalStore>((set) => ({
  isOpen: false,
  organizationId: undefined,
  onOpen: (organizationId) => set({ isOpen: true, organizationId }),
  onClose: () => set({ isOpen: false, organizationId: undefined }),
}));
