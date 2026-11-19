import { useState } from "react";

export default function ForgotPasswordForm({
  onStart,
  onVerify,
  onComplete,
  onBack,
}) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStart(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await onStart({ phone });
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
    if (password !== passwordConfirmation) {
      setError("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }
    if (
      [...password].length < 8 ||
      new TextEncoder().encode(password).length > 72
    ) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว และไม่เกิน 72 bytes");
      return;
    }
    setIsSubmitting(true);
    try {
      await onVerify({ phone, code, password });
      onComplete();
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
      const result = await onStart({ phone });
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
        <span className="auth-eyebrow">ACCOUNT RECOVERY</span>
        <h2 id="auth-title">ลืมรหัสผ่าน</h2>
        <p>
          {step === "phone"
            ? "ยืนยันตัวตนด้วยเบอร์โทรศัพท์ที่สมัครไว้"
            : `กรอกรหัส OTP ที่ส่งไปยัง ${phone} แล้วตั้งรหัสผ่านใหม่`}
        </p>
      </div>
      {notice && <div className="auth-notice" role="status">{notice}</div>}
      {error && <div className="auth-error" role="alert">{error}</div>}

      {step === "phone" ? (
        <form className="auth-form" onSubmit={handleStart}>
          <label>
            เบอร์โทรศัพท์
            <input
              type="tel"
              autoComplete="tel"
              placeholder="เช่น 0812345678 หรือ +66812345678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          <button
            className="auth-primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังส่ง OTP..." : "ส่ง OTP"}
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
          <label>
            รหัสผ่านใหม่
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label>
            ยืนยันรหัสผ่านใหม่
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
            />
          </label>
          <button
            className="auth-primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังเปลี่ยนรหัสผ่าน..." : "ตั้งรหัสผ่านใหม่"}
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
        <button className="auth-text-button" onClick={onBack} type="button">
          กลับไปเข้าสู่ระบบ
        </button>
      </div>
    </>
  );
}
