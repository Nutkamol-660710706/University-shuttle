import { SignJWT, jwtVerify } from "jose";
import { findDriverSessionById } from "../repositories/driverRepository.js";
import { getSigningKey } from "./authSession.js";

const cookieName = "silpatram_driver_session";
const sessionLifetimeSeconds = 12 * 60 * 60;

function isSecureCookie() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function readSessionCookie(request) {
  const cookieHeader = request.headers?.cookie;
  if (typeof cookieHeader !== "string") return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (name === cookieName) {
      try {
        return decodeURIComponent(valueParts.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function setDriverSessionCookie(response, driverId, authVersion) {
  const token = await new SignJWT({ av: authVersion, role: "driver" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(driverId))
    .setIssuedAt()
    .setExpirationTime(`${sessionLifetimeSeconds}s`)
    .sign(getSigningKey());
  const secure = isSecureCookie() ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionLifetimeSeconds}${secure}`,
  );
}

export function clearDriverSessionCookie(response) {
  const secure = isSecureCookie() ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export async function getSessionDriver(request) {
  const token = readSessionCookie(request);
  if (!token) return null;

  let payload;
  const signingKey = getSigningKey();
  try {
    ({ payload } = await jwtVerify(token, signingKey));
  } catch {
    return null;
  }

  if (payload.role !== "driver" || !payload.sub) return null;
  const driver = await findDriverSessionById(payload.sub);
  if (!driver || driver.authVersion !== payload.av) return null;
  delete driver.authVersion;
  return driver;
}
