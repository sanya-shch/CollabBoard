import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/current-user";

export const ACTIVE_ORG_COOKIE = "active_org";

export const activeOrgCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export function setActiveOrganizationCookie(organizationId: string) {
  return { name: ACTIVE_ORG_COOKIE, value: organizationId, options: activeOrgCookieOptions };
}

// Returns the organization the user is currently working with:
// 1. if the cookie contains a valid organizationId, and the user is still a member of it - we take it;
// 2. otherwise - the first (by date of entry) organization of the user and immediately overwrite the cookie;
// 3. if the user has no organizations at all (this should not happen - the default one is created during
// registration) - we return null, layout.tsx itself will show the NoOrganization stub instead of children
// (without redirecting to a separate page).
export async function getActiveOrganization() {
  const user = await requireAuth();
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  if (activeOrgId) {
    const membership = await db.membership.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: activeOrgId } },
      include: { organization: true },
    });
    if (membership) return membership.organization;
    // cookie points to an org of which the user is no longer a member - we fall back to the fallback below
  }

  const firstMembership = await db.membership.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { organization: true },
  });

  return firstMembership?.organization ?? null;
}

export async function getMyOrganizationsWithRole() {
  const user = await requireAuth();

  return db.membership.findMany({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
}
