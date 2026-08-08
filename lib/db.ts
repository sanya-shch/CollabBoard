import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prismaPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const pool = globalThis.prismaPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const db = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaPool = pool;
  globalThis.prisma = db;
}
