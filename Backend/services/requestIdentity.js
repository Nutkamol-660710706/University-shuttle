import { createHash } from "node:crypto";

export function hashIdentifier(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function getClientIp(request) {
  const forwardedFor = request.headers?.["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",").at(-1).trim();
  }
  return request.socket?.remoteAddress || "unknown";
}
