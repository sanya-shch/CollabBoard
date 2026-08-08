import { create } from "zustand";

interface CreateOrganizationModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateOrganizationModal = create<CreateOrganizationModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
