import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const SCHEMA_SQL = await readFile(new URL("./schema.sql", import.meta.url), "utf8");

let databasePromise;

async function createDatabase() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const pool = new pg.Pool({ connectionString, max: 10 });
    await pool.query(SCHEMA_SQL);
    return {
      driver: "postgres",
      query: (text, params) => pool.query(text, params),
      close: () => pool.end(),
    };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = path.resolve(process.env.PGLITE_DATA_DIR || ".data/pglite");
  await mkdir(dataDir, { recursive: true });
  const pglite = new PGlite(dataDir);
  await pglite.waitReady;
  await pglite.exec(SCHEMA_SQL);
  return {
    driver: "pglite (desarrollo)",
    query: (text, params) => pglite.query(text, params),
    close: () => pglite.close(),
  };
}

export function getDatabase() {
  databasePromise ??= createDatabase();
  return databasePromise;
}
