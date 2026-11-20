import { pool } from "../db/pool.js";

const locationFields = `
  latitude,
  longitude,
  accuracy_meters AS "accuracyMeters",
  updated_at AS "updatedAt"
`;

export async function findUserLocation(userId) {
  const { rows } = await pool.query(
    `SELECT ${locationFields}
     FROM user_locations
     WHERE user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function saveUserLocation(userId, location) {
  const { rows } = await pool.query(
    `INSERT INTO user_locations (
       user_id,
       latitude,
       longitude,
       accuracy_meters,
       updated_at
     )
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id) DO UPDATE SET
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       accuracy_meters = EXCLUDED.accuracy_meters,
       updated_at = now()
     RETURNING ${locationFields}`,
    [
      userId,
      location.latitude,
      location.longitude,
      location.accuracyMeters,
    ],
  );
  return rows[0];
}

export async function deleteUserLocation(userId) {
  await pool.query("DELETE FROM user_locations WHERE user_id = $1", [userId]);
}
