import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@/generated/prisma/client";

export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
