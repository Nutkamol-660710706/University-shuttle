import { AuthError } from "./authErrors.js";

export function validateWaitingStop(body) {
  const { stopNumber } = body ?? {};
  if (!Number.isInteger(stopNumber) || stopNumber < 1 || stopNumber > 999) {
    throw new AuthError(400, "หมายเลขป้ายรถไม่ถูกต้อง");
  }
  return stopNumber;
}
