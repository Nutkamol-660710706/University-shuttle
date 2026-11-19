import { useState } from "react";

const initialDetails = {
  fullName: "",
  age: "",
  gender: "",
  phone: "",
  username: "",
  password: "",
  passwordConfirmation: "",
};

export default function RegisterForm({ onStart, onVerify, onLogin }) {
  const [details, setDetails] = useState(initialDetails);
  const [code, setCode] = useState("");
  const [step, setStep] = useState("details");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setDetails((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleStart(event) {
    event.preventDefault();
    setError("");
    if (!/^[A-Za-z0-9_.-]{3,32}$/.test(details.username.trim())) {
      setError("Username ต้องมี 3–32 ตัว และใช้ a-z, 0-9, จุด, ขีดกลาง หรือขีดล่าง");
      return;
    }
    if (details.password !== details.passwordConfirmation) {
      setError("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }
    if (
      [...details.password].length < 8 ||
      new TextEncoder().encode(details.password).length > 72
    ) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว และไม่เกิน 72 bytes");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onStart({ phone: details.phone });
      setNotice(result.message);
      setStep("verification");
    } catch (startError) {
      setError(startError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onVerify({
        fullName: details.fullName,
        age: details.age,
        gender: details.gender,
        phone: details.phone,
        username: details.username,
        password: details.password,
        code,
      });
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setError("");
    setIsSubmitting(true);
    try {
      const result = await onStart({ phone: details.phone });
      setNotice(result.message);
    } catch (startError) {
      setError(startError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="auth-heading">
        <span className="auth-eyebrow">SILPATRAM MEMBER</span>
        <h2 id="auth-title">{step === "details" ? "สมัครสมาชิก" : "ยืนยันเบอร์โทรศัพท์"}</h2>
        <p>
          {step === "details"
            ? "กรอกข้อมูลเพื่อสร้างบัญชีสมาชิก"
            : `กรอกรหัส OTP ที่ส่งไปยัง ${details.phone}`}
        </p>
      </div>
      {notice && <div className="auth-notice" role="status">{notice}</div>}
      {error && <div className="auth-error" role="alert">{error}</div>}

      {step === "details" ? (
        <form className="auth-form" onSubmit={handleStart}>
          <label>
            ชื่อ-นามสกุล
            <input
              autoComplete="name"
              maxLength={100}
              name="fullName"
              value={details.fullName}
              onChange={updateField}
              required
            />
          </label>
          <div className="auth-form-row">
            <label>
              อายุ
              <input
                type="number"
                min="1"
                max="120"
                name="age"
                value={details.age}
                onChange={updateField}
                required
              />
            </label>
            <label>
              เพศ
              <select
                name="gender"
                value={details.gender}
                onChange={updateField}
                required
              >
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่น ๆ</option>
                <option value="prefer_not_to_say">ไม่ประสงค์ระบุ</option>
              </select>
            </label>
          </div>
          <label>
            เบอร์โทรศัพท์
            <input
              type="tel"
              autoComplete="tel"
              name="phone"
              placeholder="เช่น 0812345678 หรือ +66812345678"
              value={details.phone}
              onChange={updateField}
              required
            />
          </label>
          <label>
            Username
            <input
              autoComplete="username"
              maxLength={32}
              pattern="[A-Za-z0-9_.-]{3,32}"
              name="username"
              value={details.username}
              onChange={updateField}
              required
            />
            <small>ใช้ตัวอักษร a-z, ตัวเลข, จุด, ขีดกลาง หรือขีดล่าง (3–32 ตัว)</small>
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              name="password"
              value={details.password}
              onChange={updateField}
              required
            />
            <small>อย่างน้อย 8 ตัวอักษร</small>
          </label>
          <label>
            ยืนยัน Password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              name="passwordConfirmation"
              value={details.passwordConfirmation}
              onChange={updateField}
              required
            />
          </label>
          <button
            className="auth-primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังส่ง OTP..." : "ส่ง OTP เพื่อยืนยันเบอร์"}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerify}>
          <label>
            รหัส OTP 6 หลัก
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              required
            />
          </label>
          <button
            className="auth-primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังตรวจสอบ..." : "ยืนยันและสมัครสมาชิก"}
          </button>
          <button
            className="auth-text-button"
            type="button"
            onClick={() => setStep("details")}
            disabled={isSubmitting}
          >
            กลับไปแก้ไขข้อมูล
          </button>
          <button
            className="auth-text-button"
            type="button"
            onClick={resendCode}
            disabled={isSubmitting}
          >
            ส่ง OTP อีกครั้ง
          </button>
        </form>
      )}

      <div className="auth-switch">
        มีบัญชีแล้ว?
        <button className="auth-text-button" onClick={onLogin} type="button">
          เข้าสู่ระบบ
        </button>
      </div>
    </>
  );
}
