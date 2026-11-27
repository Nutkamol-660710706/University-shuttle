import bcrypt from "bcryptjs";
import {
  clearLoginRateLimit,
  reserveLoginAttempt,
} from "../repositories/userRepository.js";
import {
  endDriverTrip,
  findActiveTripForDriver,
  findDriverByUsername,
  startDriverTrip,
} from "../repositories/driverRepository.js";
import { AuthError } from "../services/authErrors.js";
import {
  clearDriverSessionCookie,
  getSessionDriver,
  setDriverSessionCookie,
} from "../services/driverSession.js";
import { assertSessionConfigured } from "../services/authSession.js";
import { getClientIp, hashIdentifier } from "../services/requestIdentity.js";

const dummyHashPromise = bcrypt.hash("silpatram-invalid-driver", 12);

function publicDriver(driver) {
  return {
    id: driver.id,
    username: driver.username,
    fullName: driver.fullName,
  };
}

async function requireDriver(request) {
  const driver = await getSessionDriver(request);
  if (!driver) throw new AuthError(401, "กรุณาเข้าสู่ระบบในฐานะคนขับก่อน");
  return driver;
}

export async function loginDriver(request, response) {
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
  const usernameIpKey = hashIdentifier(`driver-login:${username.toLowerCase()}:${ip}`);
  const ipKey = hashIdentifier(`driver-login-ip:${ip}`);

  if (
    !(await reserveLoginAttempt(usernameIpKey)) ||
    !(await reserveLoginAttempt(ipKey))
  ) {
    throw new AuthError(429, "เข้าสู่ระบบไม่สำเร็จหลายครั้ง กรุณารอสักครู่");
  }

  const driver = username ? await findDriverByUsername(username) : null;
  const passwordMatches = await bcrypt.compare(
    passwordWithinLimit ? password : "",
    driver?.password_hash ?? (await dummyHashPromise),
  );
  if (!driver || !passwordMatches || !passwordWithinLimit) {
    throw new AuthError(401, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  await clearLoginRateLimit(usernameIpKey);
  await clearLoginRateLimit(ipKey);
  await setDriverSessionCookie(response, driver.id, driver.auth_version);
  return { driver: publicDriver(driver) };
}

export async function getCurrentDriver(request) {
  const driver = await getSessionDriver(request);
  return { driver };
}

export async function logoutDriver(_request, response) {
  clearDriverSessionCookie(response);
  return { message: "ออกจากระบบคนขับแล้ว" };
}

export async function getCurrentDriverTrip(request) {
  const driver = await requireDriver(request);
  return { trip: await findActiveTripForDriver(driver.id) };
}

export async function startCurrentDriverTrip(request) {
  const driver = await requireDriver(request);
  const trip = await startDriverTrip(driver.id);
  if (trip) return { trip };

  const existingTrip = await findActiveTripForDriver(driver.id);
  if (existingTrip) return { trip: existingTrip };
  throw new AuthError(409, "รถหมายเลข 1 กำลังเดินทางอยู่");
}

export async function endCurrentDriverTrip(request) {
  const driver = await requireDriver(request);
  await endDriverTrip(driver.id);
  return { trip: null };
}
