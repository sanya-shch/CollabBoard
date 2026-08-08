import { vi } from "vitest";

export const sendVerificationEmailMock = vi.fn().mockResolvedValue(undefined);
export const sendPasswordResetEmailMock = vi.fn().mockResolvedValue(undefined);
export const sendOrgInviteEmailMock = vi.fn().mockResolvedValue(undefined);
