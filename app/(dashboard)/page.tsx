import { getActiveOrganization } from "@/lib/active-org";

import { BoardList } from "./_components/board-list";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    favorites?: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const organization = await getActiveOrganization();

  if (!organization) return null;

  const query = await searchParams;

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6">
      <BoardList organizationId={organization.id} query={query} />
    </div>
  );
};

export default DashboardPage;
