import twilio from "twilio";
import { reserveSmsRateLimit } from "../repositories/userRepository.js";
import { AuthError } from "./authErrors.js";
import { getClientIp, hashIdentifier } from "./requestIdentity.js";

function getVerifyService() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
    process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    throw new AuthError(503, "ระบบ OTP ยังไม่ได้ตั้งค่าผู้ให้บริการ SMS");
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID);
}

async function reserveSendQuota(phone, purpose, request) {
  const phoneKey = hashIdentifier(`phone:${phone}`);
  const ipKey = hashIdentifier(`ip:${getClientIp(request)}`);
  if (
    !(await reserveSmsRateLimit(phoneKey, purpose)) ||
    !(await reserveSmsRateLimit(ipKey, purpose))
  ) {
    throw new AuthError(429, "ส่ง OTP บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่");
  }
}

export async function sendVerificationCode(phone, purpose, request) {
  const verifyService = getVerifyService();
  await reserveSendQuota(phone, purpose, request);
  try {
    await verifyService.verifications.create({ to: phone, channel: "sms" });
  } catch (error) {
    console.error("SMS verification request failed", {
      code: error.code,
      status: error.status,
    });
    throw new AuthError(503, "ส่ง OTP ไม่สำเร็จ กรุณาลองใหม่ภายหลัง");
  }
}

export async function verifyCode(phone, code) {
  const verifyService = getVerifyService();
  try {
    const verification = await verifyService.verificationChecks.create({
      to: phone,
      code,
    });
    return verification.status === "approved";
  } catch (error) {
    if (error.status === 404 || error.status === 400) return false;
    console.error("SMS verification check failed", {
      code: error.code,
      status: error.status,
    });
    throw new AuthError(503, "ตรวจสอบ OTP ไม่สำเร็จ กรุณาลองใหม่ภายหลัง");
  }
}
