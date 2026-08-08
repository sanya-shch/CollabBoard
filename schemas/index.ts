import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password required" }),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
  inviteToken: z.string().optional(),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Minimum 6 characters" }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(60),
});

export const UpdateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1).max(60),
  imageUrl: z.string().url().optional().nullable(),
});

export const InviteMemberSchema = z.object({
  organizationId: z.string(),
  email: z.string().email({ message: "Please enter a valid email" }),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const CreateBoardShareLinkSchema = z.object({
  boardId: z.string(),
  expiresInDays: z.number().int().positive().optional(), // undefined = without expiration date
});

export const CreateBoardSchema = z.object({
  organizationId: z.string(),
  title: z.string().min(1).max(60),
  imageUrl: z.string().min(1),
});
