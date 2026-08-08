import { OrgItem } from "./item";

interface OrgListProps {
  organizations: { id: string; name: string; imageUrl?: string | null }[];
  activeOrgId: string;
}

export const OrgList = ({ organizations, activeOrgId }: OrgListProps) => {
  return (
    <ul className="space-y-4 flex flex-col items-center">
      {organizations.map((org) => (
        <li key={org.id}>
          <OrgItem
            id={org.id}
            name={org.name}
            imageUrl={org.imageUrl}
            isActive={org.id === activeOrgId}
          />
        </li>
      ))}
    </ul>
  );
};
