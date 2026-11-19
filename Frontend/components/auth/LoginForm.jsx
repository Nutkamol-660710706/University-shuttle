import { useState } from "react";

export default function LoginForm({
  notice,
  onLogin,
  onRegister,
  onForgotPassword,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onLogin({ username, password });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="auth-heading">
        <span className="auth-eyebrow">SILPATRAM MEMBER</span>
        <h2 id="auth-title">เข้าสู่ระบบ</h2>
        <p>เข้าสู่ระบบเพื่อใช้งานบัญชีสมาชิก</p>
      </div>
      {notice && <div className="auth-notice" role="status">{notice}</div>}
      {error && <div className="auth-error" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            autoComplete="username"
            autoFocus
            maxLength={32}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button
          className="auth-primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
      <button
        className="auth-text-button auth-forgot-link"
        onClick={onForgotPassword}
        type="button"
      >
        ลืมรหัสผ่าน?
      </button>
      <div className="auth-switch">
        ยังไม่มีบัญชี?
        <button className="auth-text-button" onClick={onRegister} type="button">
          สมัครสมาชิก
        </button>
      </div>
    </>
  );
}
