import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LoginSchema } from "@/schemas";
import { verifyPassword } from "@/lib/password";
import { buildSessionCookie } from "@/lib/session";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const body = await request.json();
  const validated = LoginSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const { email, password } = validated.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  const passwordsMatch = await verifyPassword(password, user.hashedPassword);
  if (!passwordsMatch) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  if (!user.emailVerified) {
    const verificationToken = await generateVerificationToken(user.email);

    try {
      await sendVerificationEmail(verificationToken.email, verificationToken.token);
    } catch {
      return NextResponse.json(
        { error: "The verification email could not be sent. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: "Email not confirmed. A new confirmation email has been sent." },
      { status: 200 },
    );
  }

  const response = NextResponse.json({ success: "You are logged in" });
  const cookie = await buildSessionCookie(user.id);
  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}
