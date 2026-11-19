import bcrypt from "bcryptjs";
import { createUser } from "../../repositories/userRepository.js";
import { AuthError } from "../../services/authErrors.js";
import {
  assertSessionConfigured,
  setSessionCookie,
} from "../../services/authSession.js";
import {
  validatePassword,
  validateProfile,
} from "../../services/authValidation.js";

export async function register(request, response) {
  assertSessionConfigured();
  const profile = validateProfile(request.body);
  const password = validatePassword(request.body?.password);

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
