import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Validate env at startup ──────────────────────────────────────────────────
const connectionString = process.env.DATABASE_POOLER_URL;
if (!connectionString) {
  throw new Error("DATABASE_POOLER_URL is not set.");
}

// ─── Connection pool ──────────────────────────────────────────────────────────
// max=1 for serverless (Netlify Functions / Vercel): each lambda invocation
// only needs one connection. Keeps Supabase pooler slots free.
const pool = new Pool({
  connectionString,
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("[prisma] pg pool error:", err.message);
});

// ─── Prisma client singleton ──────────────────────────────────────────────────
const adapter = new PrismaPg(pool);

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

// Persist singleton across hot-reloads in dev only.
// In production (Netlify serverless) each invocation is isolated anyway.
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
