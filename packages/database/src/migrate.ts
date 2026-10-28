import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import { getDb, repoRoot } from "./client";

/** Applies ./drizzle migrations. Idempotent; safe to run at boot in dev. */
export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  const db = getDb();
  // runtime path — bundlers must not try to resolve the folder statically
  const folders = { migrationsFolder: path.join(repoRoot(), "packages", "database", "drizzle") };
  if (url) {
    await migratePg(db as unknown as Parameters<typeof migratePg>[0], folders);
  } else {
    await migratePglite(db as Parameters<typeof migratePglite>[0], folders);
  }
}

if (import.meta.url.endsWith(process.argv[1] ?? "")) {
  runMigrations()
    .then(() => {
      console.log("[db] migrations applied");
      process.exit(0);
    })
    .catch((e) => {
      console.error("[db] migration failed", e);
      process.exit(1);
    });
}
