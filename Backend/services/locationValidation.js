import { AuthError } from "./authErrors.js";

export function validateLocation(body) {
  const { latitude, longitude, accuracyMeters } = body ?? {};
  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new AuthError(400, "พิกัดตำแหน่งไม่ถูกต้อง");
  }

  if (
    accuracyMeters !== undefined &&
    accuracyMeters !== null &&
    (typeof accuracyMeters !== "number" ||
      !Number.isFinite(accuracyMeters) ||
      accuracyMeters < 0)
  ) {
    throw new AuthError(400, "ค่าความแม่นยำของตำแหน่งไม่ถูกต้อง");
  }

  return {
    latitude,
    longitude,
    accuracyMeters: accuracyMeters ?? null,
  };
}
