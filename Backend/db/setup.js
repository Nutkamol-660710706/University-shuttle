import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { route, stops } from "../../Frontend/data.js";
import { pool } from "./pool.js";

async function createSchema() {
  const schemaUrl = new URL("../../Database/schema.sql", import.meta.url);
  const schema = await readFile(fileURLToPath(schemaUrl), "utf8");
  await pool.query(schema);
}

async function seedStops(client) {
  const stopIds = new Map();

  for (const stop of stops) {
    const { rows } = await client.query(
      `INSERT INTO bus_stops (stop_number, name, latitude, longitude, srid)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (stop_number) DO UPDATE SET
         name = EXCLUDED.name,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         srid = EXCLUDED.srid,
         updated_at = now()
       RETURNING id, stop_number`,
      [stop.number, stop.name, stop.position[0], stop.position[1], stop.srid],
    );
    stopIds.set(rows[0].stop_number, rows[0].id);
  }

  return stopIds;
}

async function seedRoute(client, stopIds) {
  const geometry = {
    type: "LineString",
    coordinates: route.path.map(([latitude, longitude]) => [longitude, latitude]),
  };
  const { rows } = await client.query(
    `INSERT INTO routes (route_code, name, color, geometry_geojson)
     VALUES ($1, $2, $3, $4::jsonb)
     ON CONFLICT (route_code) DO UPDATE SET
       name = EXCLUDED.name,
       color = EXCLUDED.color,
       geometry_geojson = EXCLUDED.geometry_geojson,
       is_active = TRUE,
       updated_at = now()
     RETURNING id`,
    [route.id, route.name, route.color, JSON.stringify(geometry)],
  );
  const routeId = rows[0].id;

  await client.query("DELETE FROM route_stops WHERE route_id = $1", [routeId]);
  for (const routeStop of route.stops) {
    const stopId = stopIds.get(routeStop.number);
    if (!stopId) {
      throw new Error(`Missing database ID for stop ${routeStop.number}`);
    }
    await client.query(
      `INSERT INTO route_stops (route_id, stop_id, stop_order)
       VALUES ($1, $2, $3)`,
      [routeId, stopId, routeStop.order],
    );
  }
}

async function setupDatabase() {
  await createSchema();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const stopIds = await seedStops(client);
    await seedRoute(client, stopIds);
    await client.query("COMMIT");
    console.log("Neon schema and initial campus tram data are ready.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

try {
  await setupDatabase();
} catch (error) {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
