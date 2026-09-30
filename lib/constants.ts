export const SESSION_COOKIE = "session";

export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_COOKIE_MAX_AGE,
};

// Hard cap on layers per board (keyboard shortcuts, insertion and duplication all
// respect this, mirroring the existing cap on click-to-insert).
export const MAX_LAYERS = 100;
