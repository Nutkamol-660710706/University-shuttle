import bcrypt from "bcryptjs";
import {
  findUserByPhone,
  updatePasswordByPhone,
} from "../../repositories/userRepository.js";
import { AuthError } from "../../services/authErrors.js";
import { assertSessionConfigured } from "../../services/authSession.js";
import {
  normalizePhone,
  validatePassword,
  validateVerificationCode,
} from "../../services/authValidation.js";
import {
  sendVerificationCode,
  verifyCode,
} from "../../services/smsVerification.js";

const resetMessage = "หากเบอร์นี้มีบัญชี ระบบได้ส่ง OTP ให้แล้ว";

export async function startPasswordReset(request) {
  assertSessionConfigured();
  const phone = normalizePhone(request.body?.phone);
  const user = await findUserByPhone(phone);
  if (user) {
    await sendVerificationCode(phone, "password_reset", request);
  }
  return { message: resetMessage };
}

export async function verifyPasswordReset(request) {
  assertSessionConfigured();
  const phone = normalizePhone(request.body?.phone);
  const code = validateVerificationCode(request.body?.code);
  const password = validatePassword(request.body?.password);

  if (!(await verifyCode(phone, code))) {
    throw new AuthError(400, "OTP ไม่ถูกต้องหรือหมดอายุ");
  }

  const updated = await updatePasswordByPhone(
    phone,
    await bcrypt.hash(password, 12),
  );
  if (!updated) {
    throw new AuthError(400, "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาตรวจสอบเบอร์โทรศัพท์");
  }
  return { message: "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบ" };
}
