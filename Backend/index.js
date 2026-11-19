import { config } from "./config.js";
import { pool } from "./db/pool.js";
import app from "./app.js";

const server = app.listen(config.apiPort, config.apiHost, () => {
  console.log(`Campus tram API listening on ${config.apiHost}:${config.apiPort}`);
});

function shutdown() {
  server.close(() => {
    pool.end().then(() => process.exit(0));
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
