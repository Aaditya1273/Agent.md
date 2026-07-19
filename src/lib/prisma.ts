import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Validate env at startup ──────────────────────────────────────────────────
// Fail fast: crash immediately on boot if the connection string is missing,
// rather than surfacing a cryptic error on the first DB call.
const connectionString = process.env.DATABASE_POOLER_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_POOLER_URL is not set. Add it to .env.local (transaction pooler, port 6543)."
  );
}

// ─── Connection pool ──────────────────────────────────────────────────────────
// Supabase transaction pooler (port 6543) — used for all runtime queries.
//
// Pool sizing:
//   Supabase free tier default: 15 server-side connections per pooler.
//   In serverless (Vercel), each lambda can spin up its own Pool instance,
//   so keep max low (2) to avoid exhausting the pooler across concurrent invocations.
//   The global singleton below ensures we reuse the same pool within a single
//   Node process (local dev / long-running server).
//
// SSL:
//   Supabase requires SSL. The pooler URL doesn't always include ?sslmode=require,
//   so we enforce it explicitly here.
const pool = new Pool({
  connectionString,
  max: 2,
  idleTimeoutMillis: 30_000,  // release idle connections after 30s
  connectionTimeoutMillis: 10_000, // fail fast if pooler is unreachable
  ssl: { rejectUnauthorized: false }, // Supabase uses self-signed cert on pooler
});

// Surface pool-level errors (e.g. lost connections) to the process log
// without crashing — Prisma will handle retry at the query level.
pool.on("error", (err) => {
  console.error("[prisma] pg pool error:", err.message);
});

// ─── Prisma client singleton ──────────────────────────────────────────────────
// In development, Next.js hot-reload would create a new PrismaClient on every
// module re-evaluation, quickly exhausting the connection pool.
// Attaching to `globalThis` prevents that — one instance per process.
const adapter = new PrismaPg(pool);

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]   // production: errors + warnings only — no query logging
        : ["error", "warn"],  // development: same conservative default; enable "query" locally if needed
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
