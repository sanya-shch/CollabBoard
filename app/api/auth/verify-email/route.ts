import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing-token", request.url));
  }

  const verificationToken = await db.verificationToken.findUnique({ where: { token } });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
  }

  const user = await db.user.findUnique({ where: { email: verificationToken.email } });
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), email: verificationToken.email },
    }),
    db.verificationToken.delete({ where: { id: verificationToken.id } }),
  ]);

  return NextResponse.redirect(new URL("/login?verified=1", request.url));
}
