import { pool } from "../db/pool.js";

const activeTripFields = `
  tram_number AS "tramNumber",
  route_id AS "routeId",
  started_at AS "startedAt",
  EXTRACT(EPOCH FROM (now() - started_at))::double precision AS "elapsedSeconds"
`;

export async function findDriverByUsername(username) {
  const { rows } = await pool.query(
    `SELECT id, username, password_hash, full_name AS "fullName", auth_version
     FROM drivers
     WHERE lower(username) = lower($1)
     LIMIT 1`,
    [username],
  );
  return rows[0] ?? null;
}

export async function findDriverSessionById(id) {
  const { rows } = await pool.query(
    `SELECT id, username, full_name AS "fullName",
            auth_version AS "authVersion"
     FROM drivers
     WHERE id = $1
     LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function startDriverTrip(driverId) {
  const { rows } = await pool.query(
    `INSERT INTO driver_trips (tram_number, driver_id, route_id)
     SELECT 1, $1, id
     FROM routes
     WHERE is_active
     ORDER BY route_code
     LIMIT 1
     ON CONFLICT (tram_number) DO UPDATE SET
       driver_id = EXCLUDED.driver_id,
       route_id = EXCLUDED.route_id,
       started_at = now(),
       ended_at = NULL,
       is_active = TRUE,
       updated_at = now()
     WHERE driver_trips.is_active = FALSE
     RETURNING ${activeTripFields}`,
    [driverId],
  );
  return rows[0] ?? null;
}

export async function findActiveTripForDriver(driverId) {
  const { rows } = await pool.query(
    `SELECT ${activeTripFields}
     FROM driver_trips
     WHERE driver_id = $1 AND is_active
     LIMIT 1`,
    [driverId],
  );
  return rows[0] ?? null;
}

export async function endDriverTrip(driverId) {
  await pool.query(
    `UPDATE driver_trips
     SET is_active = FALSE,
         ended_at = now(),
         updated_at = now()
     WHERE driver_id = $1 AND is_active`,
    [driverId],
  );
}

export async function findActiveTramTrips() {
  const { rows } = await pool.query(
    `SELECT ${activeTripFields}
     FROM driver_trips
     WHERE is_active
     ORDER BY tram_number`,
  );
  return rows;
}
