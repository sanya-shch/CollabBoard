import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/current-user";
import { setActiveOrganizationCookie } from "@/lib/active-org";

export async function POST(request: Request) {
  const { organizationId } = await request.json();

  const user = await requireAuth();
  const membership = await db.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId } },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "You are not a member of this organization." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ success: true });
  const cookie = setActiveOrganizationCookie(organizationId);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
