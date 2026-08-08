import { signSessionToken } from "@/lib/jwt";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/constants";

export async function buildSessionCookie(userId: string) {
  const token = await signSessionToken({ userId });
  return { name: SESSION_COOKIE, value: token, options: sessionCookieOptions };
}

export function clearSessionCookie() {
  return { name: SESSION_COOKIE, value: "", options: { ...sessionCookieOptions, maxAge: 0 } };
}
