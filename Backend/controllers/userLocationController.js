import { AuthError } from "../services/authErrors.js";
import { getSessionUser } from "../services/authSession.js";
import { validateLocation } from "../services/locationValidation.js";
import {
  deleteUserLocation,
  findUserLocation,
  saveUserLocation,
} from "../repositories/userLocationRepository.js";

async function requireUser(request) {
  const user = await getSessionUser(request);
  if (!user) {
    throw new AuthError(401, "กรุณาเข้าสู่ระบบก่อนใช้งานตำแหน่ง");
  }
  return user;
}

export async function getMyLocation(request) {
  const user = await requireUser(request);
  return { location: await findUserLocation(user.id) };
}

export async function updateMyLocation(request) {
  const user = await requireUser(request);
  const location = validateLocation(request.body);
  return { location: await saveUserLocation(user.id, location) };
}

export async function removeMyLocation(request) {
  const user = await requireUser(request);
  await deleteUserLocation(user.id);
  return { location: null };
}
