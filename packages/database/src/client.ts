import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite, type PgliteDB } from "drizzle-orm/pglite";
import * as schema from "./schema";

export type Db = PgliteDB<typeof schema> | ReturnType<typeof drizzlePg<typeof schema>>;

const require_ = createRequire(import.meta.url);
let db: Db | undefined;

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
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (url) {
    const postgres = require_("postgres");
    db = drizzlePg(postgres(url, { max: 10 }), { schema });
    return db;
  }
  const { PGlite } = require_("@electric-sql/pglite");
  const dataDir = process.env.PGLITE_DIR ?? path.join(repoRoot(), ".cache", "pglite");
  db = drizzlePglite(new PGlite(dataDir), { schema });
  return db;
}

export * from "./schema";
