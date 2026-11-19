import assert from "node:assert/strict";
import test from "node:test";
import { AuthError } from "../Backend/services/authErrors.js";
import {
  normalizePhone,
  validatePassword,
  validateProfile,
  validateVerificationCode,
} from "../Backend/services/authValidation.js";

test("validates a member profile and normalizes Thai phone numbers", () => {
  const profile = validateProfile({
    username: "tram_user1",
    fullName: "สมาชิก ทดสอบ",
    age: "20",
    gender: "prefer_not_to_say",
    phone: "0812345678",
  });

  assert.deepEqual(profile, {
    username: "tram_user1",
    fullName: "สมาชิก ทดสอบ",
    age: 20,
    gender: "prefer_not_to_say",
    phone: "+66812345678",
  });
});

test("rejects invalid profile values and phone numbers", () => {
  assert.throws(
    () => validateProfile({
      username: "bad name",
      fullName: "สมาชิก",
      age: 20,
      gender: "other",
      phone: "0812345678",
    }),
    (error) => error instanceof AuthError && error.status === 400,
  );
  assert.throws(
    () => validateProfile({
      username: "tram_user1",
      fullName: "สมาชิก",
      age: 0,
      gender: "other",
      phone: "0812345678",
    }),
    (error) => error instanceof AuthError && error.status === 400,
  );
  assert.throws(
    () => normalizePhone("not-a-phone"),
    (error) => error instanceof AuthError && error.status === 400,
  );
});

test("enforces password and OTP formats", () => {
  assert.equal(validatePassword("long-enough-password"), "long-enough-password");
  assert.throws(
    () => validatePassword("short"),
    (error) => error instanceof AuthError && error.status === 400,
  );
  assert.equal(validateVerificationCode("123456"), "123456");
  assert.throws(
    () => validateVerificationCode("12ab"),
    (error) => error instanceof AuthError && error.status === 400,
  );
});
