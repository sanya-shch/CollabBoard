import { getActiveOrganization, getMyOrganizationsWithRole } from "@/lib/active-org";

import { Navbar } from "./_components/navbar";
import { OrgSidebar } from "./_components/org-sidebar";
import { Sidebar } from "./_components/sidebar";
import { NoOrganization } from "./_components/no-organization";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const organization = await getActiveOrganization();
  const memberships = await getMyOrganizationsWithRole();
  const organizations = memberships.map((m) => m.organization);

  if (!organization) {
    return (
      <main className="h-full">
        <Sidebar organizations={organizations} activeOrgId="" />
        <div className="pl-[60px] h-full flex items-center justify-center">
          <NoOrganization />
        </div>
      </main>
    );
  }

  return (
    <main className="h-full">
      <Sidebar organizations={organizations} activeOrgId={organization.id} />
      <div className="pl-[60px] h-full">
        <div className="flex gap-x-3 h-full">
          <OrgSidebar organization={organization} />
          <div className="h-full flex-1">
            <Navbar organization={organization} />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;
