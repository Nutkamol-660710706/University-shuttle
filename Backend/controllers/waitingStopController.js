import { AuthError } from "../services/authErrors.js";
import { getSessionUser } from "../services/authSession.js";
import { validateWaitingStop } from "../services/waitingStopValidation.js";
import {
  deleteUserWaitingStop,
  findUserWaitingStop,
  findWaitingStopCounts,
  saveUserWaitingStop,
} from "../repositories/waitingStopRepository.js";

export async function getWaitingStopCounts(_request, response, next) {
  try {
    response.json(await findWaitingStopCounts());
  } catch (error) {
    next(error);
  }
}

async function requireUser(request) {
  const user = await getSessionUser(request);
  if (!user) {
    throw new AuthError(401, "กรุณาเข้าสู่ระบบก่อนแจ้งป้ายที่กำลังรอ");
  }
  return user;
}

export async function getMyWaitingStop(request) {
  const user = await requireUser(request);
  return { stopNumber: await findUserWaitingStop(user.id) };
}

export async function updateMyWaitingStop(request) {
  const user = await requireUser(request);
  const stopNumber = validateWaitingStop(request.body);
  const saved = await saveUserWaitingStop(user.id, stopNumber);
  if (!saved) {
    throw new AuthError(404, "ไม่พบป้ายรถที่เลือก");
  }
  return { stopNumber };
}

export async function removeMyWaitingStop(request) {
  const user = await requireUser(request);
  await deleteUserWaitingStop(user.id);
  return { stopNumber: null };
}
