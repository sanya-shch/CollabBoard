import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResetSchema } from "@/schemas";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

const GENERIC_MESSAGE = "If such an email is registered, a letter has been sent to it";

export async function POST(request: Request) {
  const body = await request.json();
  const validated = ResetSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const { email } = validated.data;
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    const resetToken = await generatePasswordResetToken(email);

    try {
      await sendPasswordResetEmail(resetToken.email, resetToken.token);
    } catch (err) {
      console.error("[forgot-password] failed to send reset email:", err);
    }
  }

  return NextResponse.json({ success: GENERIC_MESSAGE });
}
