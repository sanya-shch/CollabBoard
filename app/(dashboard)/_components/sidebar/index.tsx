import { OrgList } from "./list";
import { NewButton } from "./create-organization-button";

interface SidebarProps {
  organizations: { id: string; name: string; imageUrl?: string | null }[];
  activeOrgId: string;
}

export const Sidebar = ({ organizations, activeOrgId }: SidebarProps) => {
  return (
    <aside className="fixed z-[1] left-0 bg-slate-600 h-full w-14 flex p-2 flex-col gap-y-4 text-white">
      <OrgList organizations={organizations} activeOrgId={activeOrgId} />
      <NewButton />
    </aside>
  );
};
