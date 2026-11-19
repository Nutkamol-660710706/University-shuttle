import { createGetHandler } from "../Backend/controllers/vercelHandler.js";
import { pool } from "../Backend/db/pool.js";

export default createGetHandler(async () => {
  await pool.query("SELECT 1");
  return { status: "ok", database: "connected" };
});
