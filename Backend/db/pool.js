import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Set the Neon connection string in .env.");
}

const url = new URL(connectionString);
if (!["postgres:", "postgresql:"].includes(url.protocol)) {
  throw new Error("DATABASE_URL must use the postgres or postgresql protocol");
}
if (!["require", "verify-full"].includes(url.searchParams.get("sslmode"))) {
  throw new Error("DATABASE_URL must include sslmode=require or sslmode=verify-full");
}

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
