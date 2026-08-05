"use client";

import { useOrganization } from "@clerk/nextjs";

import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";
import { use } from "react";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    favorites?: string;
  }>;
}

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  const query = use(searchParams);
  const { organization } = useOrganization();

  return (
    <div className="flex-1 h-[calc(100%-72px)] p-6">
      {!organization ? <EmptyOrg /> : <BoardList orgId={organization.id} query={query} />}
    </div>
  );
};

export default DashboardPage;
