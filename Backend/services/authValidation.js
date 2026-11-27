import { parsePhoneNumberFromString } from "libphonenumber-js";
import { AuthError } from "./authErrors.js";

const genders = new Set(["male", "female", "other", "prefer_not_to_say"]);

function readString(value, field, maxLength) {
  if (typeof value !== "string") {
    throw new AuthError(400, `กรุณากรอก${field}`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new AuthError(400, `ข้อมูล${field}ไม่ถูกต้อง`);
  }
  return normalized;
}

export function normalizePhone(value) {
  const phone = readString(value, "เบอร์โทรศัพท์", 32);
  const parsed = parsePhoneNumberFromString(phone, "TH");
  if (!parsed?.isValid()) {
    throw new AuthError(400, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง");
  }
  return parsed.number;
}

export function validateProfile(body) {
  const username = readString(body?.username, "ชื่อผู้ใช้", 32);
  if (!/^[A-Za-z0-9_.-]{3,32}$/.test(username)) {
    throw new AuthError(
      400,
      "ชื่อผู้ใช้ต้องมี 3–32 ตัว และใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง หรือขีดล่าง",
    );
  }
  if (username.toLowerCase() === "driver1") {
    throw new AuthError(400, "ชื่อผู้ใช้นี้สงวนไว้สำหรับบัญชีคนขับ");
  }

  const fullName = readString(body?.fullName, "ชื่อ", 100);
  const age = Number(body?.age);
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    throw new AuthError(400, "อายุต้องเป็นจำนวนเต็มระหว่าง 1 ถึง 120");
  }

  if (!genders.has(body?.gender)) {
    throw new AuthError(400, "กรุณาเลือกเพศ");
  }

  return {
    username,
    fullName,
    age,
    gender: body.gender,
    phone: normalizePhone(body?.phone),
  };
}

export function validatePassword(value) {
  if (typeof value !== "string") {
    throw new AuthError(400, "กรุณากรอกรหัสผ่าน");
  }
  if (Buffer.byteLength(value, "utf8") > 72) {
    throw new AuthError(400, "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และไม่เกิน 72 bytes");
  }
  const length = [...value].length;
  if (length < 8) {
    throw new AuthError(400, "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และไม่เกิน 72 bytes");
  }
  return value;
}

export function validateVerificationCode(value) {
  if (typeof value !== "string" || !/^\d{6}$/.test(value)) {
    throw new AuthError(400, "กรุณากรอกรหัส OTP 6 หลัก");
  }
  return value;
}
