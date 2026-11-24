import { pool } from "../db/pool.js";

export async function findWaitingStopCounts() {
  const { rows } = await pool.query(`
    SELECT
      s.stop_number AS "stopNumber",
      count(w.user_id)::integer AS "waitingCount"
    FROM bus_stops AS s
    LEFT JOIN user_waiting_stops AS w
      ON w.stop_id = s.id
      AND w.updated_at > now() - interval '2 hours'
    GROUP BY s.id
    ORDER BY s.stop_number
  `);
  return rows;
}

export async function findUserWaitingStop(userId) {
  const { rows } = await pool.query(
    `SELECT s.stop_number AS "stopNumber"
     FROM user_waiting_stops AS w
     JOIN bus_stops AS s ON s.id = w.stop_id
     WHERE w.user_id = $1
       AND w.updated_at > now() - interval '2 hours'`,
    [userId],
  );
  return rows[0]?.stopNumber ?? null;
}

export async function saveUserWaitingStop(userId, stopNumber) {
  const { rows } = await pool.query(
    `INSERT INTO user_waiting_stops (user_id, stop_id, updated_at)
     SELECT $1, s.id, now()
     FROM bus_stops AS s
     WHERE s.stop_number = $2
     ON CONFLICT (user_id) DO UPDATE SET
       stop_id = EXCLUDED.stop_id,
       updated_at = now()
     RETURNING user_id`,
    [userId, stopNumber],
  );
  return rows.length > 0;
}

export async function deleteUserWaitingStop(userId) {
  await pool.query("DELETE FROM user_waiting_stops WHERE user_id = $1", [userId]);
}
