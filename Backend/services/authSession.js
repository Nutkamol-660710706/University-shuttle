import { SignJWT, jwtVerify } from "jose";
import { findSessionUserById } from "../repositories/userRepository.js";
import { AuthError } from "./authErrors.js";

const cookieName = "silpatram_session";
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;

function getSigningKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new AuthError(503, "ระบบเข้าสู่ระบบยังไม่ได้ตั้งค่า AUTH_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export function assertSessionConfigured() {
  getSigningKey();
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

export async function setSessionCookie(response, userId, authVersion) {
  const token = await new SignJWT({ av: authVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${sessionLifetimeSeconds}s`)
    .sign(getSigningKey());
  const secure =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
      ? "; Secure"
      : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionLifetimeSeconds}${secure}`,
  );
}

export function clearSessionCookie(response) {
  const secure =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
      ? "; Secure"
      : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export async function getSessionUser(request) {
  const token = readSessionCookie(request);
  if (!token) return null;

  let subject;
  let authVersion;
  const signingKey = getSigningKey();
  try {
    const { payload } = await jwtVerify(token, signingKey);
    subject = payload.sub;
    authVersion = payload.av;
  } catch {
    return null;
  }

  if (!subject) return null;
  const user = await findSessionUserById(subject);
  if (!user || user.authVersion !== authVersion) return null;
  delete user.authVersion;
  return user;
}
