import { List } from "./list";
import { CreateOrganizationButton } from "./create-organization-button";

export const Sidebar = () => {
  return (
    <aside className="fixed z-[1] left-0 bg-slate-800 h-full w-[60px] flex p-3 flex-col gap-y-4 text-white">
      <List />
      <CreateOrganizationButton />
    </aside>
  );
};
