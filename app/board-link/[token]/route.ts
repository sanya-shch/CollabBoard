import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const link = await db.boardShareLink.findUnique({ where: { token } });

  const isValid = link && !link.revoked && (!link.expiresAt || link.expiresAt > new Date());

  if (!isValid) {
    return NextResponse.redirect(new URL("/invalid-link", request.url));
  }

  const response = NextResponse.redirect(new URL(`/board/${link.boardId}`, request.url));

  response.cookies.set(`share_${link.boardId}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: link.expiresAt
      ? Math.min(COOKIE_MAX_AGE_SECONDS, Math.floor((link.expiresAt.getTime() - Date.now()) / 1000))
      : COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
