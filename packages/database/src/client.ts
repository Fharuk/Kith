import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

/**
 * One type for the handle. A union of the PGlite and postgres-js drivers would collapse
 * every builder method into an uninhabitable intersection, so the PGlite shape is
 * canonical (identical API) and the postgres handle is cast at the boundary.
 */
export type Db = ReturnType<typeof drizzlePglite<typeof schema>>;

const require_ = createRequire(import.meta.url);

/**
 * The handle lives on globalThis, not in module scope.
 *
 * Next.js instantiates separate module graphs for the RSC render and for route handlers;
 * with module-scoped state each graph would open its OWN PGlite instance on the same data
 * directory — two in-memory Postgres engines writing one dir (silent divergence, then
 * corruption). globalThis is per-process, so every graph shares one engine.
 */
const GLOBAL_KEY = Symbol.for("kith.database.handle");
type GlobalWithDb = typeof globalThis & { [GLOBAL_KEY]?: Db };

function getHandle(): Db | undefined {
  return (globalThis as GlobalWithDb)[GLOBAL_KEY];
}

function setHandle(handle: Db): Db {
  (globalThis as GlobalWithDb)[GLOBAL_KEY] = handle;
  return handle;
}

/** Walk up from cwd to the monorepo root (pnpm-workspace.yaml marker). */
export function repoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/**
 * Dev/demo: PGlite (embedded WASM Postgres) persisted at <repo>/.cache/pglite — this
 * sandbox has no Postgres server. Prod: real Postgres via DATABASE_URL (postgres-js).
 * Selection is by env, never by NODE_ENV (architecture §6).
 */
export function getDb(): Db {
  const existing = getHandle();
  if (existing) return existing;
  const url = process.env.DATABASE_URL;
  if (url) {
    const postgres = require_("postgres");
    return setHandle(drizzlePg(postgres(url, { max: 10 }), { schema }) as unknown as Db);
  }
  const { PGlite } = require_("@electric-sql/pglite");
  const dataDir = process.env.PGLITE_DIR ?? path.join(repoRoot(), ".cache", "pglite");
  return setHandle(drizzlePglite(new PGlite(dataDir), { schema }));
}

export * from "./schema";
