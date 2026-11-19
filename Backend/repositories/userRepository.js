import { pool } from "../db/pool.js";

const publicUserFields = `
  id,
  username,
  full_name AS "fullName",
  age,
  gender,
  phone_e164 AS phone,
  phone_verified_at AS "phoneVerifiedAt"
`;

export async function findUserByUsername(username) {
  const { rows } = await pool.query(
    `SELECT id, username, password_hash, auth_version
     FROM users
     WHERE lower(username) = lower($1)
     LIMIT 1`,
    [username],
  );
  return rows[0] ?? null;
}

export async function findUserByPhone(phone) {
  const { rows } = await pool.query(
    `SELECT ${publicUserFields}
     FROM users
     WHERE phone_e164 = $1
     LIMIT 1`,
    [phone],
  );
  return rows[0] ?? null;
}

export async function findPublicUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${publicUserFields}
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findSessionUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${publicUserFields}, auth_version AS "authVersion"
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser(user) {
  const { rows } = await pool.query(
    `INSERT INTO users (
       username,
       password_hash,
       full_name,
       age,
       gender,
       phone_e164,
       phone_verified_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, NULL)
     RETURNING ${publicUserFields}, auth_version AS "authVersion"`,
    [
      user.username,
      user.passwordHash,
      user.fullName,
      user.age,
      user.gender,
      user.phone,
    ],
  );
  return rows[0];
}

export async function updatePasswordByPhone(phone, passwordHash) {
  const { rowCount } = await pool.query(
    `UPDATE users
     SET password_hash = $2,
         phone_verified_at = COALESCE(phone_verified_at, now()),
         auth_version = auth_version + 1,
         updated_at = now()
     WHERE phone_e164 = $1`,
    [phone, passwordHash],
  );
  return rowCount > 0;
}

export async function reserveSmsRateLimit(identifierHash, purpose) {
  const { rowCount } = await pool.query(
    `INSERT INTO auth_sms_rate_limits (
       identifier_hash,
       purpose,
       window_started_at,
       send_count,
       next_allowed_at
     )
     VALUES ($1, $2, now(), 1, now() + interval '60 seconds')
     ON CONFLICT (identifier_hash, purpose) DO UPDATE SET
       window_started_at = CASE
         WHEN auth_sms_rate_limits.window_started_at <= now() - interval '1 hour'
         THEN now()
         ELSE auth_sms_rate_limits.window_started_at
       END,
       send_count = CASE
         WHEN auth_sms_rate_limits.window_started_at <= now() - interval '1 hour'
         THEN 1
         ELSE auth_sms_rate_limits.send_count + 1
       END,
       next_allowed_at = now() + interval '60 seconds'
     WHERE auth_sms_rate_limits.next_allowed_at <= now()
       AND (
         auth_sms_rate_limits.window_started_at <= now() - interval '1 hour'
         OR auth_sms_rate_limits.send_count < 5
       )
     RETURNING identifier_hash`,
    [identifierHash, purpose],
  );
  return rowCount === 1;
}

export async function reserveLoginAttempt(identifierHash) {
  const { rowCount } = await pool.query(
    `INSERT INTO auth_login_rate_limits (
       identifier_hash,
       window_started_at,
       attempt_count
     )
     VALUES ($1, now(), 1)
     ON CONFLICT (identifier_hash) DO UPDATE SET
       window_started_at = CASE
         WHEN auth_login_rate_limits.window_started_at <= now() - interval '15 minutes'
         THEN now()
         ELSE auth_login_rate_limits.window_started_at
       END,
       attempt_count = CASE
         WHEN auth_login_rate_limits.window_started_at <= now() - interval '15 minutes'
         THEN 1
         ELSE auth_login_rate_limits.attempt_count + 1
       END
     WHERE auth_login_rate_limits.window_started_at <= now() - interval '15 minutes'
       OR auth_login_rate_limits.attempt_count < 10
     RETURNING identifier_hash`,
    [identifierHash],
  );
  return rowCount === 1;
}

export async function clearLoginRateLimit(identifierHash) {
  await pool.query(
    "DELETE FROM auth_login_rate_limits WHERE identifier_hash = $1",
    [identifierHash],
  );
}
