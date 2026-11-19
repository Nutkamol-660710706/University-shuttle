import { useState } from "react";
import { X } from "lucide-react";
import ForgotPasswordForm from "./ForgotPasswordForm.jsx";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";

export default function AuthDialog({
  initialMode,
  onClose,
  auth,
}) {
  const [mode, setMode] = useState(initialMode);
  const [notice, setNotice] = useState("");

  const switchMode = (nextMode) => {
    setNotice("");
    setMode(nextMode);
  };

  return (
    <div
      className="auth-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          className="auth-close"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
        >
          <X size={19} />
        </button>
        {mode === "login" && (
          <LoginForm
            notice={notice}
            onLogin={async (credentials) => {
              await auth.signIn(credentials);
              onClose();
            }}
            onRegister={() => switchMode("register")}
            onForgotPassword={() => switchMode("forgot")}
          />
        )}
        {mode === "register" && (
          <RegisterForm
            onStart={auth.startRegistration}
            onVerify={async (details) => {
              await auth.completeRegistration(details);
              onClose();
            }}
            onLogin={() => switchMode("login")}
          />
        )}
        {mode === "forgot" && (
          <ForgotPasswordForm
            onStart={auth.startPasswordReset}
            onVerify={auth.verifyPasswordReset}
            onComplete={() => {
              setNotice("เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบ");
              setMode("login");
            }}
            onBack={() => switchMode("login")}
          />
        )}
      </section>
    </div>
  );
}
