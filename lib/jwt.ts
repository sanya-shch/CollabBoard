import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET env variable is not set");
}

export type SessionPayload = {
  userId: string;
};

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    // expired, counterfeit, or invalid token
    return null;
  }
}
