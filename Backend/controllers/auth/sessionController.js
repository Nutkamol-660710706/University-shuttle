import bcrypt from "bcryptjs";
import {
  clearLoginRateLimit,
  findPublicUserById,
  findUserByUsername,
  reserveLoginAttempt,
} from "../../repositories/userRepository.js";
import { AuthError } from "../../services/authErrors.js";
import {
  assertSessionConfigured,
  clearSessionCookie,
  getSessionUser,
  setSessionCookie,
} from "../../services/authSession.js";
import { getClientIp, hashIdentifier } from "../../services/requestIdentity.js";

const dummyHashPromise = bcrypt.hash("silpatram-invalid-user", 12);

export async function login(request, response) {
  assertSessionConfigured();
  const rawUsername =
    typeof request.body?.username === "string"
      ? request.body.username.trim()
      : "";
  const username = rawUsername.length <= 32 ? rawUsername : "";
  const password =
    typeof request.body?.password === "string" ? request.body.password : "";
  const passwordWithinLimit = Buffer.byteLength(password, "utf8") <= 72;
  const ip = getClientIp(request);
  const usernameIpKey = hashIdentifier(`login:${username.toLowerCase()}:${ip}`);
  const ipKey = hashIdentifier(`login-ip:${ip}`);

  if (
    !(await reserveLoginAttempt(usernameIpKey)) ||
    !(await reserveLoginAttempt(ipKey))
  ) {
    throw new AuthError(429, "เข้าสู่ระบบไม่สำเร็จหลายครั้ง กรุณารอสักครู่");
  }

  const user = username
    ? await findUserByUsername(username)
    : null;
  const passwordMatches = await bcrypt.compare(
    passwordWithinLimit ? password : "",
    user?.password_hash ?? (await dummyHashPromise),
  );
  if (!user || !passwordMatches || !passwordWithinLimit) {
    throw new AuthError(401, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  await clearLoginRateLimit(usernameIpKey);
  await clearLoginRateLimit(ipKey);
  const publicUser = await findPublicUserById(user.id);
  await setSessionCookie(response, user.id, user.auth_version);
  return { user: publicUser };
}

export async function getCurrentUser(request) {
  return { user: await getSessionUser(request) };
}

export async function logout(_request, response) {
  clearSessionCookie(response);
  return { message: "ออกจากระบบแล้ว" };
}
