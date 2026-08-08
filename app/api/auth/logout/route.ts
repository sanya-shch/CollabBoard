import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ success: "You are out" });
  const cookie = clearSessionCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}
