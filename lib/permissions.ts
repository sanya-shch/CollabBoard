import { db } from "@/lib/db";
import { requireUser } from "@/lib/current-user";

export const getMembership = async (organizationId: string) => {
  const user = await requireUser();

  return db.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId } },
  });
};

export const requireOrgMember = async (organizationId: string) => {
  const membership = await getMembership(organizationId);
  if (!membership) throw new Error("You are not a member of this organization");
  return membership;
};

export const requireOrgAdmin = async (organizationId: string) => {
  const membership = await requireOrgMember(organizationId);
  if (membership.role !== "ADMIN") throw new Error("Administrator rights required");
  return membership;
};

export const assertNotLastAdmin = async (organizationId: string, userId: string) => {
  const admins = await db.membership.count({
    where: { organizationId, role: "ADMIN" },
  });
  const targetIsAdmin = await db.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });

  if (targetIsAdmin?.role === "ADMIN" && admins <= 1) {
    throw new Error("You can't leave a team without any admin");
  }
};
