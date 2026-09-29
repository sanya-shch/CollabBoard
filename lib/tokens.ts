import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

const TOKEN_TTL_HOURS = 24;

function expiresIn(hours: number) {
  return new Date(new Date().getTime() + hours * 60 * 60 * 1000);
}

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = expiresIn(TOKEN_TTL_HOURS);

  await db.verificationToken.deleteMany({ where: { email } });

  return db.verificationToken.create({
    data: { email, token, expires },
  });
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = expiresIn(1);

  await db.passwordResetToken.deleteMany({ where: { email } });

  return db.passwordResetToken.create({
    data: { email, token, expires },
  });
};

export const generateOrgInviteToken = async (params: {
  organizationId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
}) => {
  const token = uuidv4();
  const expiresAt = expiresIn(24 * 7);

  await db.invite.deleteMany({
    where: { organizationId: params.organizationId, email: params.email },
  });

  return db.invite.create({
    data: {
      organizationId: params.organizationId,
      email: params.email,
      role: params.role,
      token,
      expiresAt,
    },
  });
};

export const generateBoardShareToken = async (params: {
  boardId: string;
  expiresInDays?: number;
  canEdit?: boolean;
}) => {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = params.expiresInDays ? expiresIn(24 * params.expiresInDays) : null;

  return db.boardShareLink.create({
    data: { boardId: params.boardId, token, expiresAt, canEdit: params.canEdit ?? true },
  });
};
