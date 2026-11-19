import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByPhone,
} from "../../repositories/userRepository.js";
import { AuthError } from "../../services/authErrors.js";
import {
  assertSessionConfigured,
  setSessionCookie,
} from "../../services/authSession.js";
import {
  normalizePhone,
  validatePassword,
  validateProfile,
  validateVerificationCode,
} from "../../services/authValidation.js";
import {
  sendVerificationCode,
  verifyCode,
} from "../../services/smsVerification.js";

const registrationMessage = "หากเบอร์นี้ยังสมัครได้ ระบบได้ส่ง OTP ให้แล้ว";

export async function startRegistration(request) {
  assertSessionConfigured();
  const phone = normalizePhone(request.body?.phone);
  const existingUser = await findUserByPhone(phone);
  if (!existingUser) {
    await sendVerificationCode(phone, "registration", request);
  }
  return { message: registrationMessage };
}

export async function verifyRegistration(request, response) {
  assertSessionConfigured();
  const profile = validateProfile(request.body);
  const password = validatePassword(request.body?.password);
  const code = validateVerificationCode(request.body?.code);

  if (!(await verifyCode(profile.phone, code))) {
    throw new AuthError(400, "OTP ไม่ถูกต้องหรือหมดอายุ");
  }

  let user;
  try {
    user = await createUser({
      ...profile,
      passwordHash: await bcrypt.hash(password, 12),
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new AuthError(409, "ชื่อผู้ใช้หรือเบอร์โทรศัพท์นี้ถูกใช้แล้ว");
    }
    throw error;
  }

  await setSessionCookie(response, user.id, user.authVersion);
  const publicUser = { ...user };
  delete publicUser.authVersion;
  return { user: publicUser };
}
